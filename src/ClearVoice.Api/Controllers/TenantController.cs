using System.Threading.Tasks;
using ClearVoice.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClearVoice.Api.Controllers
{
    [ApiController]
    [Route("api/v1/tenant")]
    [Authorize]
    public class TenantController : ControllerBase
    {
        private readonly IClearVoiceDbContext _context;
        private readonly ITenantProvider _tenantProvider;

        public TenantController(IClearVoiceDbContext context, ITenantProvider tenantProvider)
        {
            _context = context;
            _tenantProvider = tenantProvider;
        }

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId.Value);
            if (tenant == null) return NotFound();

            return Ok(new
            {
                data = new
                {
                    tenant.Id,
                    tenant.LegalName,
                    tenant.TaxId,
                    tenant.Address,
                    tenant.City,
                    tenant.Country,
                    tenant.Phone,
                    tenant.Industry,
                    tenant.Website,
                    tenant.CreatedAt
                }
            });
        }

        [HttpPut("settings")]
        [Authorize(Policy = "CanManageTeam")]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateTenantSettingsRequest request)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId.Value);
            if (tenant == null) return NotFound();

            tenant.LegalName = request.LegalName ?? tenant.LegalName;
            tenant.TaxId = request.TaxId ?? tenant.TaxId;
            tenant.Address = request.Address;
            tenant.City = request.City;
            tenant.Country = request.Country;
            tenant.Phone = request.Phone;
            tenant.Industry = request.Industry;
            tenant.Website = request.Website;

            await _context.SaveChangesAsync(default);

            return Ok(new { data = "Settings updated successfully" });
        }
    }

    public class UpdateTenantSettingsRequest
    {
        public string? LegalName { get; set; }
        public string? TaxId { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
        public string? Industry { get; set; }
        public string? Website { get; set; }
    }
}
