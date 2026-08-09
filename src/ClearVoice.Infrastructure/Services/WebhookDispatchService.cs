using System;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using ClearVoice.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ClearVoice.Infrastructure.Services
{
    public interface IWebhookDispatchService
    {
        Task DispatchInvoiceClearedEventAsync(Guid tenantId, Guid invoiceId, string clearanceId);
    }

    public class WebhookDispatchService : IWebhookDispatchService
    {
        private readonly IClearVoiceDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<WebhookDispatchService> _logger;

        public WebhookDispatchService(IClearVoiceDbContext context, IHttpClientFactory httpClientFactory, ILogger<WebhookDispatchService> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task DispatchInvoiceClearedEventAsync(Guid tenantId, Guid invoiceId, string clearanceId)
        {
            var webhooks = await _context.WebhookEndpoints
                .Where(w => w.TenantId == tenantId && w.Active)
                .ToListAsync();

            if (!webhooks.Any()) return;

            var payload = new
            {
                Event = "InvoiceCleared",
                InvoiceId = invoiceId,
                ClearanceId = clearanceId,
                Timestamp = DateTimeOffset.UtcNow
            };

            var payloadJson = JsonSerializer.Serialize(payload);
            var client = _httpClientFactory.CreateClient();

            foreach (var webhook in webhooks)
            {
                try
                {
                    var request = new HttpRequestMessage(HttpMethod.Post, webhook.Url)
                    {
                        Content = new StringContent(payloadJson, Encoding.UTF8, "application/json")
                    };

                    // Create HMAC signature
                    using (var hmac = new HMACSHA256(Convert.FromBase64String(webhook.SigningSecret)))
                    {
                        var signature = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(payloadJson)));
                        request.Headers.Add("X-ClearVoice-Signature", signature);
                    }

                    // In a real app, you'd save a WebhookDelivery record, handle retries and timeouts
                    var response = await client.SendAsync(request);
                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogWarning("Webhook delivery failed for Endpoint {WebhookId} with Status {StatusCode}", webhook.Id, response.StatusCode);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error dispatching webhook to {Url}", webhook.Url);
                }
            }
        }
    }
}
