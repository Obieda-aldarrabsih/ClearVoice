using System;
using System.Linq;
using System.Threading.Tasks;
using ClearVoice.Api.DTOs;
using ClearVoice.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClearVoice.Api.Controllers
{
    [ApiController]
    [Route("api/v1/apikeys")]
    [Authorize(Policy = "CanManageTeam")] // Only tenant admins can manage API keys
    public class ApiKeysController : ControllerBase
    {
        private readonly IApiKeyService _apiKeyService;
        private readonly ITenantProvider _tenantProvider;
        private readonly IClearVoiceDbContext _context;

        public ApiKeysController(IApiKeyService apiKeyService, ITenantProvider tenantProvider, IClearVoiceDbContext context)
        {
            _apiKeyService = apiKeyService;
            _tenantProvider = tenantProvider;
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> GenerateApiKey([FromBody] GenerateApiKeyRequest request)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var result = _apiKeyService.GenerateApiKey(tenantId.Value, request.Name);

            _context.ApiKeys.Add(result.ApiKeyEntity);
            await _context.SaveChangesAsync(default);

            return Ok(new GenerateApiKeyResponse
            {
                Name = result.ApiKeyEntity.Name,
                ClearTextKey = result.ClearTextKey
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetApiKeys()
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var keys = await _context.ApiKeys
                .Where(k => k.TenantId == tenantId.Value && k.RevokedAt == null)
                .Select(k => new { k.Id, k.Name, Prefix = k.KeyPrefix, k.CreatedAt, k.LastUsedAt })
                .ToListAsync();

            return Ok(new { data = keys });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RevokeApiKey(Guid id)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var key = await _context.ApiKeys.FirstOrDefaultAsync(k => k.Id == id && k.TenantId == tenantId.Value);
            if (key == null || key.RevokedAt != null) return NotFound();

            key.RevokedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync(default);

            return NoContent();
        }
    }
}
