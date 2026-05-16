using Aerzteportal.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aerzteportal.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    NisAuthService nis,
    SessionStore store,
    NisSession session) : ControllerBase
{
    public record LoginRequest(string Username, string Password);

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { error = "Username and password are required." });

        var login = await nis.LoginAsync(req.Username, req.Password, ct);
        if (!login.Success || login.Token is null || string.IsNullOrEmpty(login.Token.Token))
            return Unauthorized(new { error = login.Code ?? "wrongCredentials" });

        var sessionId = store.Create(login.Token);
        session.IssueCookie(sessionId);
        return Ok(new { ok = true });
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var token = await session.GetAccessTokenAsync(ct);
        if (token is null) return Ok(new { user = (object?)null });

        // TODO: hit NIS GraphQL `me` here once we have the GraphQL client wired
        // up. For now report just "logged in" so the SPA can route past /login.
        return Ok(new { user = new { id = session.CurrentId } });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var id = session.CurrentId;
        if (id is not null)
        {
            var token = await session.GetAccessTokenAsync(ct);
            if (token is not null) await nis.SignOutAsync(token, ct);
            store.Remove(id);
        }
        session.Clear();
        return Ok(new { ok = true });
    }
}
