using System.Net.Http.Headers;
using System.Text.Json;
using Aerzteportal.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aerzteportal.Api.Controllers;

[ApiController]
public class FilesController(
    IHttpClientFactory httpClientFactory,
    NisGraphQLService gql,
    NisSession session,
    ILogger<FilesController> logger) : ControllerBase
{
    /// <summary>
    /// Streams a NIS-stored file through the portal so the browser never
    /// holds the bearer token. NIS serves binaries from /api/file/{id}.
    /// </summary>
    [HttpGet("api/files/{fileId}")]
    public async Task<IActionResult> Download(string fileId, CancellationToken ct)
    {
        var token = await session.GetAccessTokenAsync(ct);
        if (token is null) return Unauthorized();

        var client = httpClientFactory.CreateClient("Nis");
        using var req = new HttpRequestMessage(HttpMethod.Get, $"api/file/{Uri.EscapeDataString(fileId)}");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var res = await client.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);
        if (!res.IsSuccessStatusCode)
        {
            logger.LogWarning("[nis-file] {Id} HTTP {Status}", fileId, (int)res.StatusCode);
            return StatusCode((int)res.StatusCode);
        }
        var contentType = res.Content.Headers.ContentType?.MediaType ?? "application/octet-stream";
        var stream = await res.Content.ReadAsStreamAsync(ct);
        // Preserve any filename NIS sent so "Save as" defaults sensibly.
        var disposition = res.Content.Headers.ContentDisposition?.ToString();
        if (!string.IsNullOrEmpty(disposition))
            Response.Headers["Content-Disposition"] = disposition;
        return File(stream, contentType);
    }

    /// <summary>
    /// Uploads a doctor's document to NIS in two hops: first to the tempfile
    /// endpoint (binary upload), then attached to the claim as a
    /// FileCommunication tagged "aerzteportal".
    /// </summary>
    [HttpPost("api/cases/{caseId:int}/upload")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<IActionResult> Upload(int caseId, [FromForm] IFormFileCollection files, CancellationToken ct)
    {
        var token = await session.GetAccessTokenAsync(ct);
        if (token is null) return Unauthorized();
        if (files == null || files.Count == 0) return BadRequest(new { error = "No files received." });

        // The recipient on createCommunication is the claimant's client id —
        // resolve it from NIS so the SPA doesn't have to know it.
        var clientId = await ResolveClaimantClientIdAsync(caseId, ct);
        if (clientId is null) return BadRequest(new { error = "Could not resolve claimant client for this case." });

        var client = httpClientFactory.CreateClient("Nis");

        var attached = new List<object>();
        foreach (var file in files)
        {
            // Step 1 — push the binary to NIS's tempfile slot, get back an id.
            using var multipart = new MultipartFormDataContent();
            using var stream = file.OpenReadStream();
            var part = new StreamContent(stream);
            part.Headers.ContentType = new MediaTypeHeaderValue(
                string.IsNullOrEmpty(file.ContentType) ? "application/octet-stream" : file.ContentType);
            multipart.Add(part, "files", file.FileName);
            using var tempReq = new HttpRequestMessage(HttpMethod.Post, "api/tempfile") { Content = multipart };
            tempReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            using var tempRes = await client.SendAsync(tempReq, ct);
            var tempBody = await tempRes.Content.ReadAsStringAsync(ct);
            if (!tempRes.IsSuccessStatusCode)
            {
                logger.LogWarning("[nis-tempfile] HTTP {Status}: {Body}", (int)tempRes.StatusCode, tempBody);
                return StatusCode(502, new { error = "Temp upload failed.", details = tempBody });
            }
            using var tempDoc = JsonDocument.Parse(tempBody);
            // Tempfile returns an array with { id, filename, isMalicious }.
            var fileId = tempDoc.RootElement.ValueKind == JsonValueKind.Array
                && tempDoc.RootElement.GetArrayLength() > 0
                && tempDoc.RootElement[0].TryGetProperty("id", out var idEl)
                && idEl.ValueKind == JsonValueKind.String
                    ? idEl.GetString()
                    : null;
            if (string.IsNullOrEmpty(fileId))
                return StatusCode(502, new { error = "Tempfile response had no id." });

            // Step 2 — attach to the claim via createCommunication.
            var attachVars = new
            {
                claimId = caseId,
                clientId = clientId.Value,
                fileId,
                subject = file.FileName,
            };
            var attachData = await gql.QueryAsync("CreateFileCommunication", NisQueries.CreateFileCommunication, attachVars, ct);
            if (attachData is null)
                return StatusCode(502, new { error = $"Attach failed for {file.FileName}." });

            attached.Add(new { filename = file.FileName, fileId });
        }

        return Ok(new { attached });
    }

    private async Task<int?> ResolveClaimantClientIdAsync(int caseId, CancellationToken ct)
    {
        var data = await gql.QueryAsync("CaseDetail", NisQueries.CaseDetail, new { id = caseId }, ct);
        if (data is null || !data.Value.TryGetProperty("claim", out var claim) || claim.ValueKind != JsonValueKind.Object)
            return null;
        if (!claim.TryGetProperty("claimant", out var claimant)
            || !claimant.TryGetProperty("client", out var clientNode)
            || !clientNode.TryGetProperty("id", out var idEl))
            return null;
        return idEl.ValueKind switch
        {
            JsonValueKind.Number when idEl.TryGetInt32(out var n) => n,
            JsonValueKind.String when int.TryParse(idEl.GetString(), out var n) => n,
            _ => null,
        };
    }
}
