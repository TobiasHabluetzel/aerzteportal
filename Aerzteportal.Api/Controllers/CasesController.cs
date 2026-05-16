using System.Text.Json;
using Aerzteportal.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aerzteportal.Api.Controllers;

[ApiController]
[Route("api/cases")]
public class CasesController(NisGraphQLService gql, NisSession session) : ControllerBase
{
    [HttpGet("")]
    public async Task<IActionResult> List(
        [FromQuery] string status = "OPEN",
        [FromQuery] int offset = 0,
        [FromQuery] int limit = 20,
        CancellationToken ct = default)
    {
        if (await session.GetAccessTokenAsync(ct) is null) return Unauthorized();

        // The cases list is filtered by the doctor's NIS user id so they only
        // see cases assigned to them. Resolving the id happens here so the SPA
        // never has to know it.
        var meData = await gql.QueryAsync("Me", NisQueries.Me, null, ct);
        if (meData is null || !meData.Value.TryGetProperty("me", out var me)
            || !me.TryGetProperty("id", out var idEl))
        {
            return Unauthorized();
        }
        // NIS user ids are numeric on the wire (the cases filter uses [Int]).
        if (!TryGetInt(idEl, out var assignedUserId)) return Unauthorized();

        var variables = new
        {
            filters = new
            {
                status,
                includeDrafts = false,
                clientContactsOnly = false,
                assignedUserIds = new[] { assignedUserId },
            },
            order = new { by = "CREATED", direction = "DESCENDING" },
            pagination = new { offset, limit },
        };

        var data = await gql.QueryAsync("CaseListPage_Cases", NisQueries.CaseListPage_Cases, variables, ct);
        if (data is null || !data.Value.TryGetProperty("claims", out var claims))
            return Ok(new { items = Array.Empty<object>(), totalCount = 0 });
        return Ok(claims);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken ct)
    {
        if (await session.GetAccessTokenAsync(ct) is null) return Unauthorized();

        var data = await gql.QueryAsync("CaseDetail", NisQueries.CaseDetail, new { id }, ct);
        if (data is null || !data.Value.TryGetProperty("claim", out var claim) || claim.ValueKind != JsonValueKind.Object)
            return NotFound();

        // Pass through most of the claim but strip the tag-filtered surfaces
        // down to "aerzteportal" — anything else is internal to NIS and not
        // for the external doctor.
        var filteredCommunications = FilterByTag(
            claim.TryGetProperty("communications", out var comms)
                && comms.ValueKind == JsonValueKind.Object
                && comms.TryGetProperty("items", out var commItems)
                && commItems.ValueKind == JsonValueKind.Array
                    ? commItems
                    : default,
            "aerzteportal");

        var filteredTasks = FilterByTag(
            claim.TryGetProperty("tasksWithQuestionnaires", out var tasks) && tasks.ValueKind == JsonValueKind.Array
                ? tasks
                : default,
            "aerzteportal");

        return Ok(new
        {
            id = claim.TryGetProperty("id", out var idEl) ? idEl.GetRawText().Trim('"') : null,
            number = StringFrom(claim, "number"),
            status = StringFrom(claim, "status"),
            createdOn = StringFrom(claim, "createdOn"),
            incidentOn = StringFrom(claim, "incidentOn"),
            phase = claim.TryGetProperty("phase", out var phase) ? (object?)phase : null,
            claimant = claim.TryGetProperty("claimant", out var claimant) ? (object?)claimant : null,
            incidentLocation = claim.TryGetProperty("incidentLocation", out var loc) ? (object?)loc : null,
            coverCause = claim.TryGetProperty("coverCause", out var cc) ? (object?)cc : null,
            diagnoses = claim.TryGetProperty("diagnoses", out var dx) ? (object?)dx : null,
            policy = claim.TryGetProperty("policy", out var pol) ? (object?)pol : null,
            communications = filteredCommunications,
            tasks = filteredTasks,
        });
    }

    private static JsonElement[] FilterByTag(JsonElement arr, string tag)
    {
        if (arr.ValueKind != JsonValueKind.Array) return Array.Empty<JsonElement>();
        var result = new List<JsonElement>();
        foreach (var item in arr.EnumerateArray())
        {
            if (!item.TryGetProperty("tags", out var tags) || tags.ValueKind != JsonValueKind.Array) continue;
            var match = false;
            foreach (var t in tags.EnumerateArray())
            {
                if (t.TryGetProperty("name", out var name)
                    && name.ValueKind == JsonValueKind.String
                    && string.Equals(name.GetString(), tag, StringComparison.OrdinalIgnoreCase))
                {
                    match = true;
                    break;
                }
            }
            if (match) result.Add(item);
        }
        return result.ToArray();
    }

    private static string? StringFrom(JsonElement el, string prop)
        => el.TryGetProperty(prop, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null;

    private static bool TryGetInt(JsonElement el, out int value)
    {
        switch (el.ValueKind)
        {
            case JsonValueKind.Number:
                return el.TryGetInt32(out value);
            case JsonValueKind.String:
                return int.TryParse(el.GetString(), out value);
            default:
                value = 0;
                return false;
        }
    }
}
