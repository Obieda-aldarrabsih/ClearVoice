using System.Text.Json;
using ClearVoice.Application.Interfaces;
using ClearVoice.Domain.Entities;
using ClearVoice.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ClearVoice.Workers;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IServiceProvider _serviceProvider;

    public Worker(ILogger<Worker> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessOutboxMessagesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing outbox messages.");
            }
            
            // Poll every 5 seconds
            await Task.Delay(5000, stoppingToken);
        }
    }

    private async Task ProcessOutboxMessagesAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IClearVoiceDbContext>();
        var clearanceClient = scope.ServiceProvider.GetRequiredService<IClearanceClient>();
        var webhookDispatch = scope.ServiceProvider.GetRequiredService<IWebhookDispatchService>();

        // Fetch up to 20 unprocessed messages
        var messages = await context.OutboxMessages
            .Where(m => m.Status == "pending" && m.NextAttemptAt <= DateTimeOffset.UtcNow)
            .OrderBy(m => m.CreatedAt)
            .Take(20)
            .ToListAsync(stoppingToken);

        if (!messages.Any()) return;

        foreach (var message in messages)
        {
            _logger.LogInformation("Processing Outbox Message {MessageId} of type {Type}", message.Id, message.Type);

            if (message.Type == "InvoiceSubmittedEvent")
            {
                var payload = JsonSerializer.Deserialize<JsonElement>(message.Payload);
                var invoiceId = Guid.Parse(payload.GetProperty("InvoiceId").GetString()!);

                var invoice = await context.Invoices.Include(i => i.InvoiceLines).FirstOrDefaultAsync(i => i.Id == invoiceId, stoppingToken);
                
                if (invoice != null && invoice.Status == "PENDING")
                {
                    // Serialize the invoice as a dummy UBL payload for the mock client
                    var ublPayloadDummy = JsonSerializer.Serialize(invoice);
                    var result = await clearanceClient.SubmitAsync(ublPayloadDummy);

                    if (result.Success)
                    {
                        invoice.Status = "CLEARED";
                        invoice.UblDocumentRef = result.ResponseCode; // e.g., "CLR-123"
                        invoice.QrPayload = result.QrPayload;
                        invoice.ClearedAt = DateTimeOffset.UtcNow;
                        
                        _logger.LogInformation("Invoice {InvoiceId} successfully cleared by the clearance service.", invoice.Id);

                        // Dispatch Webhooks
                        await webhookDispatch.DispatchInvoiceClearedEventAsync(invoice.TenantId, invoice.Id, result.ResponseCode!);
                    }
                    else
                    {
                        invoice.Status = "REJECTED";
                        // Log or handle rejection in a real system
                        _logger.LogWarning("Invoice {InvoiceId} rejected by the clearance service. Reason: {Reason}", invoice.Id, result.ErrorDetail);
                    }
                }
            }

            // Mark message as processed
            message.Status = "processed";
            await context.SaveChangesAsync(stoppingToken);
        }
    }
}
