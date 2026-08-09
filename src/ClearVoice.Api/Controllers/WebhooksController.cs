using System;
using System.Security.Cryptography;
using System.Threading.Tasks;
using ClearVoice.Api.DTOs;
using ClearVoice.Application.Interfaces;
using ClearVoice.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    }
}
