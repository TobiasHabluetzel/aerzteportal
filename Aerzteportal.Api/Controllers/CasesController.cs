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
