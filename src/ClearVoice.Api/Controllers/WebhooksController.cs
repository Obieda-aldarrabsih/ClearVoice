using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using ClearVoice.Api.DTOs;
using ClearVoice.Application.Interfaces;
using ClearVoice.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClearVoice.Api.Controllers
{
    [ApiController]
    [Route("api/v1/webhooks")]
    [Authorize(Policy = "CanManageTeam")]
    public class WebhooksController : ControllerBase
    {
        private readonly IClearVoiceDbContext _context;
        private readonly ITenantProvider _tenantProvider;

        public WebhooksController(IClearVoiceDbContext context, ITenantProvider tenantProvider)
        {
            _context = context;
            _tenantProvider = tenantProvider;
        }

        [HttpPost]
        public async Task<IActionResult> RegisterWebhook([FromBody] RegisterWebhookRequest request)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            // Generate a secure signing secret for the webhook payload
            var secretBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(secretBytes);
            }
            var signingSecret = Convert.ToBase64String(secretBytes);

            var endpoint = new WebhookEndpoint
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId.Value,
                Url = request.Url,
                SigningSecret = signingSecret,
                Active = true
            };

            _context.WebhookEndpoints.Add(endpoint);
            await _context.SaveChangesAsync(default);

            return Ok(new WebhookResponse
            {
                Id = endpoint.Id.ToString(),
                Url = endpoint.Url,
                SigningSecret = endpoint.SigningSecret
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetWebhooks()
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var endpoints = await _context.WebhookEndpoints
                .Where(w => w.TenantId == tenantId.Value)
                .Select(w => new {
                    id = w.Id,
                    url = w.Url,
                    active = w.Active,
                    events = w.SubscribedEvents,
                    signingSecret = w.SigningSecret
                })
                .ToListAsync();

            return Ok(new { data = endpoints });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWebhook(Guid id, [FromBody] UpdateWebhookRequest request)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var endpoint = await _context.WebhookEndpoints.FirstOrDefaultAsync(w => w.Id == id && w.TenantId == tenantId.Value);
            if (endpoint == null) return NotFound();

            if (request.Url != null) endpoint.Url = request.Url;
            if (request.Active.HasValue) endpoint.Active = request.Active.Value;
            if (request.Events != null) endpoint.SubscribedEvents = request.Events;

            await _context.SaveChangesAsync(default);

            return Ok(new { data = "Webhook updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWebhook(Guid id)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var endpoint = await _context.WebhookEndpoints.FirstOrDefaultAsync(w => w.Id == id && w.TenantId == tenantId.Value);
            if (endpoint == null) return NotFound();

            _context.WebhookEndpoints.Remove(endpoint);
            await _context.SaveChangesAsync(default);

            return NoContent();
        }

        [HttpPost("{id}/test")]
        public async Task<IActionResult> TestWebhook(Guid id)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var endpoint = await _context.WebhookEndpoints.FirstOrDefaultAsync(w => w.Id == id && w.TenantId == tenantId.Value);
            if (endpoint == null) return NotFound();

            // Enqueue a test delivery event to the outbox
            var testEvent = new {
                Event = "ping",
                Timestamp = DateTimeOffset.UtcNow,
                Message = "Test webhook delivery from ClearVoice."
            };

            var outboxMessage = new OutboxMessage
            {
                Id = Guid.NewGuid(),
                Type = "webhook_delivery",
                Payload = System.Text.Json.JsonSerializer.Serialize(new { EndpointId = endpoint.Id, Payload = testEvent }),
                Status = "pending",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.OutboxMessages.Add(outboxMessage);
            await _context.SaveChangesAsync(default);

            return Accepted(new { data = "Test webhook enqueued" });
        }
    }

    public class UpdateWebhookRequest
    {
        public string? Url { get; set; }
        public bool? Active { get; set; }
        public string[]? Events { get; set; }
    }
}
