using ClearVoice.Application.Interfaces;
using ClearVoice.Infrastructure.Data;
using ClearVoice.Infrastructure.Services;
using ClearVoice.Workers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddHostedService<Worker>();

// The worker needs DbContext, ClearanceClient, and WebhookDispatchService
builder.Services.AddDbContext<ClearVoiceDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IClearVoiceDbContext>(provider => provider.GetRequiredService<ClearVoiceDbContext>());

builder.Services.AddHttpClient();
builder.Services.AddScoped<IClearanceClient, MockClearanceClient>();
builder.Services.AddScoped<IWebhookDispatchService, WebhookDispatchService>();

var host = builder.Build();
host.Run();
