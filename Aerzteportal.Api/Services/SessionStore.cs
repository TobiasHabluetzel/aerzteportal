using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace Aerzteportal.Api.Services;

/// <summary>
/// In-memory session store keyed by an opaque cookie value. The cookie is
/// HttpOnly so the SPA never sees the NIS access token; the server proxies
/// upstream calls using the stored tokens and refreshes them transparently.
///
/// In-memory is fine for the demo (single Railway instance, single
/// process). Swap for Redis or a signed cookie if we ever scale out.
/// </summary>
public class SessionStore
{
    private readonly ConcurrentDictionary<string, Session> _sessions = new();

    public string Create(NisJwtToken token)
    {
        var id = NewId();
        _sessions[id] = Session.From(token);
        return id;
    }

    public Session? Get(string id) => _sessions.TryGetValue(id, out var s) ? s : null;

    public void Update(string id, NisJwtToken token)
    {
        _sessions[id] = Session.From(token);
    }

    public void Remove(string id) => _sessions.TryRemove(id, out _);

    private static string NewId()
    {
        Span<byte> buf = stackalloc byte[24];
        RandomNumberGenerator.Fill(buf);
        return Convert.ToBase64String(buf).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }
}

public class Session
{
    public string AccessToken { get; set; } = "";
    public string RefreshToken { get; set; } = "";
    public DateTimeOffset ExpiresAt { get; set; }

    public bool NearlyExpired() =>
        // Refresh ~1 min before NIS would reject the token. Catches clock
        // skew and keeps upstream calls from racing the expiry.
        DateTimeOffset.UtcNow >= ExpiresAt.AddSeconds(-60);

    public static Session From(NisJwtToken token) => new()
    {
        AccessToken = token.Token ?? "",
        RefreshToken = token.RefreshToken ?? "",
        ExpiresAt = DateTimeOffset.UtcNow.AddSeconds(token.ExpiresIn),
    };
}
