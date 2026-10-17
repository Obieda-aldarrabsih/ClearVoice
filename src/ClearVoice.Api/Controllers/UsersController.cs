using System;
using System.Linq;
using System.Threading.Tasks;
using ClearVoice.Application.Interfaces;
using ClearVoice.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ClearVoice.Api.Controllers
{
    [ApiController]
    [Route("api/v1/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IClearVoiceDbContext _context;
        private readonly ITenantProvider _tenantProvider;
        private readonly IPasswordHasher _passwordHasher;

        public UsersController(IClearVoiceDbContext context, ITenantProvider tenantProvider, IPasswordHasher passwordHasher)
        {
            _context = context;
            _tenantProvider = tenantProvider;
            _passwordHasher = passwordHasher;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) throw new UnauthorizedAccessException();
            return Guid.Parse(userIdStr);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userId = GetUserId();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound();

            return Ok(new
            {
                data = new
                {
                    id = user.Id,
                    email = user.Email,
                    fullName = user.FullName,
                    role = user.Role,
                    status = user.Status
                }
            });
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileRequest request)
        {
            var userId = GetUserId();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound();

            user.FullName = request.FullName;
            await _context.SaveChangesAsync(default);

            return Ok(new { data = new { id = user.Id, fullName = user.FullName } });
        }

        [HttpPut("me/password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = GetUserId();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound();

            if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(new { error = "Invalid current password" });
            }

            user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync(default);

            return Ok(new { data = "Password updated successfully" });
        }

        [HttpGet]
        [Authorize(Policy = "CanManageTeam")]
        public async Task<IActionResult> GetTeam()
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var users = await _context.Users
                .Where(u => u.TenantId == tenantId.Value)
                .Select(u => new {
                    id = u.Id,
                    email = u.Email,
                    fullName = u.FullName,
                    role = u.Role,
                    status = u.Status,
                    createdAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(new { data = users });
        }

        [HttpPost]
        [Authorize(Policy = "CanManageTeam")]
        public async Task<IActionResult> InviteUser([FromBody] InviteUserRequest request)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { error = "User with this email already exists." });
            }

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId.Value,
                Email = request.Email,
                FullName = request.FullName,
                Role = request.Role,
                Status = "pending",
                CreatedAt = DateTimeOffset.UtcNow,
                PasswordHash = _passwordHasher.HashPassword(Guid.NewGuid().ToString()) // Random temporary password
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync(default);

            return Ok(new { data = new { id = newUser.Id, email = newUser.Email, status = newUser.Status } });
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "CanManageTeam")]
        public async Task<IActionResult> RemoveUser(Guid id)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var currentUserId = GetUserId();
            if (id == currentUserId)
            {
                return BadRequest(new { error = "Cannot remove yourself." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId.Value);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync(default);

            return NoContent();
        }
    }

    public class UpdateProfileRequest
    {
        public string FullName { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class InviteUserRequest
    {
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "FinanceUser";
    }
}
