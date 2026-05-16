using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Aerzteportal.Api.Services;

/// <summary>
/// Posts GraphQL operations to NIS using the logged-in doctor's access
/// token. Always proxied through the backend so the token never reaches
/// the browser; the response's `data` element is returned to the caller
/// so we don't have to model every field as a typed record.
/// </summary>
public class NisGraphQLService(
    IHttpClientFactory httpClientFactory,
    IConfiguration config,
    NisSession session,
    ILogger<NisGraphQLService> logger)
{
    public async Task<JsonElement?> QueryAsync(string operationName, string query, object? variables, CancellationToken ct)
    {
        var token = await session.GetAccessTokenAsync(ct);
        if (token is null) return null;

        var path = config["Nis:GraphqlPath"] ?? "graphql";
        var client = httpClientFactory.CreateClient("Nis");

        var body = JsonSerializer.Serialize(new
        {
            operationName,
            query,
            variables = variables ?? new { },
        });

        using var req = new HttpRequestMessage(HttpMethod.Post, path)
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        };
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        using var res = await client.SendAsync(req, ct);
        var json = await res.Content.ReadAsStringAsync(ct);
        if (!res.IsSuccessStatusCode)
        {
            logger.LogWarning("[nis-gql] {Op} HTTP {Status}: {Body}", operationName, (int)res.StatusCode, json);
            return null;
        }

        using var doc = JsonDocument.Parse(json);
        if (doc.RootElement.TryGetProperty("errors", out var errs) && errs.ValueKind == JsonValueKind.Array && errs.GetArrayLength() > 0)
        {
            logger.LogWarning("[nis-gql] {Op} returned errors: {Errors}", operationName, errs.GetRawText());
        }
        if (!doc.RootElement.TryGetProperty("data", out var data)) return null;
        return data.Clone();
    }
}
