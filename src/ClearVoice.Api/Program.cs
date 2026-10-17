using ClearVoice.Api.Services;
using ClearVoice.Application.Interfaces;
using ClearVoice.Infrastructure.Data;
using FluentValidation;
using ClearVoice.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Configure Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("AuthRateLimit", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 5;
        opt.QueueLimit = 0;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });
    options.RejectionStatusCode = 429;
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

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
app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready");

// Auto-Migrate and Seed Database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ClearVoiceDbContext>();
        context.Database.Migrate();

        var passwordHasher = services.GetRequiredService<IPasswordHasher>();

            if (!context.Tenants.Any())
        {
            var tenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");
            context.Tenants.Add(new ClearVoice.Domain.Entities.Tenant
            {
                Id = tenantId,
                LegalName = "Acme Corp (Demo)",
                TaxId = "123456789",
                CreatedAt = DateTimeOffset.UtcNow
            });

            context.Users.Add(new ClearVoice.Domain.Entities.User
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
                TenantId = tenantId,
                Email = "admin@company.com",
                PasswordHash = passwordHasher.HashPassword("password123"),
                Role = "TenantAdmin",
                Status = "active",
                CreatedAt = DateTimeOffset.UtcNow
            });

            context.Users.Add(new ClearVoice.Domain.Entities.User
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000003"),
                TenantId = tenantId, // Using same tenant for simplicity
                Email = "system@clearvoice.com",
                PasswordHash = passwordHasher.HashPassword("admin123"),
                Role = "SystemOperator",
                Status = "active",
                CreatedAt = DateTimeOffset.UtcNow
            });

            context.SaveChanges();
            Console.WriteLine("Demo Tenant and User seeded.");
        }
        else
        {
            // Ensure admin user has correct argon2 hash (migration fix)
            var adminUser = context.Users.FirstOrDefault(u => u.Email == "admin@company.com");
            if (adminUser != null && !adminUser.PasswordHash.StartsWith("$argon"))
            {
                adminUser.PasswordHash = passwordHasher.HashPassword("password123");
                context.SaveChanges();
                Console.WriteLine("Admin user password hash updated to Argon2.");
            }

            // Ensure system operator exists
            var sysUser = context.Users.FirstOrDefault(u => u.Email == "system@clearvoice.com");
            if (sysUser == null)
            {
                var tenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");
                context.Users.Add(new ClearVoice.Domain.Entities.User
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000003"),
                    TenantId = tenantId,
                    Email = "system@clearvoice.com",
                    PasswordHash = passwordHasher.HashPassword("admin123"),
                    Role = "SystemOperator",
                    Status = "active",
                    CreatedAt = DateTimeOffset.UtcNow
                });
                context.SaveChanges();
                Console.WriteLine("SystemOperator user seeded.");
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred while migrating or seeding the database: {ex.Message}");
    }
}


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
