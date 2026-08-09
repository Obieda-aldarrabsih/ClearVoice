using System;
using System.Linq;
using System.Threading.Tasks;
using ClearVoice.Api.DTOs;
using ClearVoice.Application.Interfaces;
using ClearVoice.Domain.Entities;
using ClearVoice.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClearVoice.Api.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ClearVoiceDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public AuthController(ClearVoiceDbContext context, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtTokenGenerator)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Tenants.AnyAsync(t => t.TaxId == request.TaxId))
                return Conflict(new { error = "Tenant with this Tax ID already exists" });

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return Conflict(new { error = "User with this email already exists" });

            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                LegalName = request.LegalName,
                TaxId = request.TaxId,
                CreatedAt = DateTimeOffset.UtcNow
            };

            var user = new User
            {
                Id = Guid.NewGuid(),
                TenantId = tenant.Id,
                Email = request.Email,
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                Role = "TenantAdmin",
                CreatedAt = DateTimeOffset.UtcNow,
                Status = "active" // Skip email verification for MVP simplicity unless configured
            };

            _context.Tenants.Add(tenant);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Created("", new { userId = user.Id, tenantId = tenant.Id });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { error = "Invalid credentials" });
            }

            var accessToken = _jwtTokenGenerator.GenerateToken(user);
            var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

            // Set refresh token in httpOnly cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);

            return Ok(new AuthResponse { AccessToken = accessToken, ExpiresIn = 15 * 60 });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("refreshToken");
            return NoContent();
        }
    }
}
