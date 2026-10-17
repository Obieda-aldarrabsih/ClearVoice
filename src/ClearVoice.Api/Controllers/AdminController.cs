using System;
using System.Linq;
using System.Threading.Tasks;
using ClearVoice.Infrastructure.Data;
using ClearVoice.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClearVoice.Api.Controllers
{
    [ApiController]
    [Route("api/v1/admin")]
    [Authorize(Roles = "SystemOperator")] // Only accessible by global system admins
    public class AdminController : ControllerBase
    {
        private readonly IClearVoiceDbContext _context;

        public AdminController(IClearVoiceDbContext context)
        {
            _context = context;
        }

        [HttpGet("tenants")]
        public async Task<IActionResult> GetTenants()
        {
            var tenants = await _context.Tenants
                .Select(t => new {
                    t.Id,
                    t.LegalName,
                    t.TaxId,
                    t.Industry,
                    t.Country,
                    t.CreatedAt,
                    UserCount = _context.Users.Count(u => u.TenantId == t.Id),
                    InvoiceCount = _context.Invoices.Count(i => i.TenantId == t.Id)
                })
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(new { data = tenants });
        }

        [HttpGet("access-requests")]
        public async Task<IActionResult> GetAccessRequests()
        {
            var requests = await _context.AccessRequests
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new {
                    r.Id,
                    r.FullName,
                    r.Email,
                    r.OrganizationName,
                    r.Message,
                    r.Status,
                    r.CreatedAt
                })
                .ToListAsync();

            return Ok(new { data = requests });
        }

        [HttpPost("access-requests/{id}/approve")]
        public async Task<IActionResult> ApproveAccessRequest(Guid id)
        {
            var request = await _context.AccessRequests.FirstOrDefaultAsync(r => r.Id == id);
            if (request == null) return NotFound();

            if (request.Status != "Pending") 
                return BadRequest(new { error = "Only pending requests can be approved." });

            request.Status = "Approved";
            await _context.SaveChangesAsync(default);

            // In a real application, you would send an email to the user with a registration link or temp credentials
            return Ok(new { message = "Request approved." });
        }

        [HttpPost("access-requests/{id}/reject")]
        public async Task<IActionResult> RejectAccessRequest(Guid id)
        {
            var request = await _context.AccessRequests.FirstOrDefaultAsync(r => r.Id == id);
            if (request == null) return NotFound();

            if (request.Status != "Pending") 
                return BadRequest(new { error = "Only pending requests can be rejected." });

            request.Status = "Rejected";
            await _context.SaveChangesAsync(default);

            return Ok(new { message = "Request rejected." });
        }
    }
}
