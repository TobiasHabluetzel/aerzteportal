var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(
        new System.Text.Json.Serialization.JsonStringEnumConverter()));
builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton<Aerzteportal.Api.Services.SessionStore>();
builder.Services.AddScoped<Aerzteportal.Api.Services.NisAuthService>();
builder.Services.AddScoped<Aerzteportal.Api.Services.NisSession>();

// NIS — base URL only. Per-request auth is handled by the auth layer using
// the doctor's credentials and short-lived access tokens, not a static API
// token, so we don't set Authorization on the named client.
builder.Services.AddHttpClient("Nis", client =>
{
    var endpoint = builder.Configuration["Nis:Endpoint"]
        ?? throw new InvalidOperationException("Nis:Endpoint is required");
    client.BaseAddress = new Uri(endpoint.TrimEnd('/') + "/");
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();
app.MapGet("/healthz", () => Results.Ok("healthy"));
app.MapFallbackToFile("index.html");

app.Run();
