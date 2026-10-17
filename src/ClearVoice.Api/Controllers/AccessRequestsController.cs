using System;
using System.Threading.Tasks;
using ClearVoice.Domain.Entities;
using ClearVoice.Application.Interfaces;
using ClearVoice.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ClearVoice.Api.Controllers
{
    [ApiController]
    [Route("api/v1/access-requests")]
    [EnableRateLimiting("AuthRateLimit")]
    public class AccessRequestsController : ControllerBase
    {
        private readonly IClearVoiceDbContext _context;

        public AccessRequestsController(IClearVoiceDbContext context)
        {
            _context = context;
        }

        public class CreateAccessRequestDto
        {
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string OrganizationName { get; set; } = string.Empty;
            public string Message { get; set; } = string.Empty;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitRequest([FromBody] CreateAccessRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.FullName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.OrganizationName))
            {
                return BadRequest(new { error = "FullName, Email, and OrganizationName are required." });
            }

            var accessRequest = new AccessRequest
            {
                FullName = request.FullName,
                Email = request.Email,
                OrganizationName = request.OrganizationName,
                Message = request.Message ?? "",
                Status = "Pending",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.AccessRequests.Add(accessRequest);
            await _context.SaveChangesAsync(default);

            return Ok(new { message = "Your access request has been submitted successfully." });
        }
    }
}
