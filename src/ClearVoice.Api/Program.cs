using ClearVoice.Api.Services;
using ClearVoice.Application.Interfaces;
using ClearVoice.Infrastructure.Data;
using FluentValidation;
using ClearVoice.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? 
    "Host=localhost;Database=clearvoice;Username=postgres;Password=Password123!";
builder.Services.AddDbContext<ClearVoiceDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddHealthChecks()
    .AddDbContextCheck<ClearVoiceDbContext>();

// Configure DI
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantProvider, TenantProvider>();
builder.Services.AddScoped<IPasswordHasher, Argon2PasswordHasher>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IClearVoiceDbContext>(provider => provider.GetRequiredService<ClearVoiceDbContext>());
builder.Services.AddScoped<IApiKeyService, ApiKeyService>();
builder.Services.AddHttpClient(); // Required for WebhookDispatchService
builder.Services.AddScoped<ClearVoice.Infrastructure.Services.IWebhookDispatchService, ClearVoice.Infrastructure.Services.WebhookDispatchService>();

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(ClearVoice.Application.Invoices.Commands.SubmitInvoiceCommand).Assembly));
builder.Services.AddValidatorsFromAssembly(typeof(ClearVoice.Application.Invoices.Commands.SubmitInvoiceCommandValidator).Assembly);

// Configure Auth
var jwtSecret = builder.Configuration["JwtSettings:Secret"] ?? "SuperSecretKeyForDevelopmentOnly12345!";

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "ClearVoice",
            ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? "ClearVoiceClient",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    })
    .AddScheme<ClearVoice.Api.Auth.ApiKeyAuthenticationOptions, ClearVoice.Api.Auth.ApiKeyAuthenticationHandler>(
        ClearVoice.Api.Auth.ApiKeyAuthenticationOptions.DefaultScheme, options => { });

builder.Services.AddAuthorization(options =>
{
    // A policy for users or APIs that can submit invoices
    options.AddPolicy("CanSubmitInvoices", policy =>
    {
        policy.AuthenticationSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
        policy.AuthenticationSchemes.Add(ClearVoice.Api.Auth.ApiKeyAuthenticationOptions.DefaultScheme);
        policy.RequireAuthenticatedUser();
    });

    options.AddPolicy("CanManageTeam", policy => policy.RequireRole("TenantAdmin", "SystemOperator"));
});

var app = builder.Build();

app.UseMiddleware<ClearVoice.Api.Middleware.ExceptionHandlingMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready");


app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
