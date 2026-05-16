using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Aerzteportal.Api.Services;

/// <summary>
/// Thin wrapper around NIS's /api/auth endpoints. The portal logs in once
/// with the doctor's credentials, gets a short-lived access token + a
/// refresh token, and reuses the refresh token to mint new access tokens
/// when the current one is close to expiry.
/// </summary>
public class NisAuthService(IHttpClientFactory httpClientFactory, IConfiguration config, ILogger<NisAuthService> logger)
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    public async Task<NisLoginResponse> LoginAsync(string username, string password, CancellationToken ct)
    {
        // Organisation code is set per deployment (Nis__OrganisationCode env
        // var on Railway), not entered by the doctor on every login.
        var organisationCode = config["Nis:OrganisationCode"] ?? "";

        var client = httpClientFactory.CreateClient("Nis");
        var body = JsonSerializer.Serialize(new { organisationCode, username, password }, JsonOpts);
        using var req = new HttpRequestMessage(HttpMethod.Post, "api/auth")
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        };
        using var res = await client.SendAsync(req, ct);
        var json = await res.Content.ReadAsStringAsync(ct);
        if (!res.IsSuccessStatusCode)
        {
            logger.LogWarning("[nis-auth] login HTTP {Status}: {Body}", (int)res.StatusCode, json);
            return new NisLoginResponse(false, "wrongCredentials", null);
        }
        var parsed = JsonSerializer.Deserialize<NisLoginResponse>(json, JsonOpts)
            ?? new NisLoginResponse(false, "wrongCredentials", null);
        return parsed;
    }

    /// <summary>Mints a new access token from a refresh token. Null when refresh fails (expired / revoked).</summary>
    public async Task<NisJwtToken?> RefreshAsync(string refreshToken, CancellationToken ct)
    {
        var client = httpClientFactory.CreateClient("Nis");
        var body = JsonSerializer.Serialize(new { refreshToken }, JsonOpts);
        using var req = new HttpRequestMessage(HttpMethod.Post, "api/auth/refresh")
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        };
        using var res = await client.SendAsync(req, ct);
        if (!res.IsSuccessStatusCode)
        {
            logger.LogWarning("[nis-auth] refresh HTTP {Status}", (int)res.StatusCode);
            return null;
        }
        var json = await res.Content.ReadAsStringAsync(ct);
        // The refresh endpoint returns the same shape as /api/auth's `token`
        // field — sometimes wrapped, sometimes not. Tolerate both.
        try
        {
            var direct = JsonSerializer.Deserialize<NisJwtToken>(json, JsonOpts);
            if (direct?.Token is not null) return direct;
        }
        catch { /* fall through */ }
        try
        {
            var wrapped = JsonSerializer.Deserialize<NisLoginResponse>(json, JsonOpts);
            return wrapped?.Token;
        }
        catch { return null; }
    }

    public async Task SignOutAsync(string accessToken, CancellationToken ct)
    {
        try
        {
            var client = httpClientFactory.CreateClient("Nis");
            using var req = new HttpRequestMessage(HttpMethod.Post, "api/auth/signout");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            await client.SendAsync(req, ct);
        }
        catch (Exception ex)
        {
            // Signout is best-effort — the session is dropped locally regardless.
            logger.LogWarning(ex, "[nis-auth] signout call failed");
        }
    }
}

public record NisLoginResponse(
    bool Success,
    string? Code,
    NisJwtToken? Token);

public record NisJwtToken(
    string? Token,
    string? TokenType,
    int ExpiresIn,
    string? RefreshToken);
