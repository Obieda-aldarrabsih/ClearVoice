using System;
using System.Threading.Tasks;
using ClearVoice.Api.DTOs;
using ClearVoice.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

            _context.Add(result.ApiKeyEntity);
            await _context.SaveChangesAsync(default);

            return Ok(new GenerateApiKeyResponse
            {
                Name = result.ApiKeyEntity.Name,
                ClearTextKey = result.ClearTextKey
            });
        }
    }
}
