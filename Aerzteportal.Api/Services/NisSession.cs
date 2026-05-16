using System.Net.Http.Headers;

namespace Aerzteportal.Api.Services;

/// <summary>
/// Glue between the per-request cookie and a usable access token. Handles
/// transparent refresh when the access token is close to expiry — callers
/// just ask for a token to attach to the next NIS request.
/// </summary>
public class NisSession(
    IHttpContextAccessor httpContext,
    SessionStore store,
    NisAuthService nis,
    ILogger<NisSession> logger)
{
    public const string CookieName = "ap_sess";

    public string? CurrentId
    {
        get
        {
            var ctx = httpContext.HttpContext;
            return ctx?.Request.Cookies[CookieName];
        }
    }

    /// <summary>
    /// Returns a fresh-enough access token for the current request, refreshing
    /// it through NIS if it's near expiry. Null when there's no session or the
    /// refresh failed (session is dropped in that case).
    /// </summary>
    public async Task<string?> GetAccessTokenAsync(CancellationToken ct)
    {
        var id = CurrentId;
        if (id is null) return null;
        var session = store.Get(id);
        if (session is null) return null;

        if (session.NearlyExpired())
        {
            var fresh = await nis.RefreshAsync(session.RefreshToken, ct);
            if (fresh is null)
            {
                logger.LogInformation("[nis-session] refresh failed for {Id} — dropping session", id);
                store.Remove(id);
                Clear();
                return null;
            }
            store.Update(id, fresh);
            session = store.Get(id);
            if (session is null) return null;
        }
        return session.AccessToken;
    }

    public void IssueCookie(string sessionId)
    {
        var ctx = httpContext.HttpContext;
        if (ctx is null) return;
        ctx.Response.Cookies.Append(CookieName, sessionId, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            // Cookie outlives the access token; the refresh flow keeps the
            // session valid as long as NIS still accepts our refresh token.
            Expires = DateTimeOffset.UtcNow.AddDays(30),
        });
    }

    public void Clear()
    {
        var ctx = httpContext.HttpContext;
        if (ctx is null) return;
        ctx.Response.Cookies.Delete(CookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Path = "/",
        });
    }

    public static AuthenticationHeaderValue Bearer(string accessToken) =>
        new("Bearer", accessToken);
}
