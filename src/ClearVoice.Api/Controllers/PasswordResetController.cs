using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using ClearVoice.Application.Interfaces;
using ClearVoice.Domain.Entities;
using ClearVoice.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;

namespace ClearVoice.Api.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    [EnableRateLimiting("AuthRateLimit")]
    public class PasswordResetController : ControllerBase
    {
        private readonly IClearVoiceDbContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public PasswordResetController(IClearVoiceDbContext context, IPasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public class ForgotPasswordRequest
        {
            public string Email { get; set; } = string.Empty;
        }

        public class ResetPasswordRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Token { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email)) return BadRequest(new { error = "Email is required" });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            // Generic response to prevent email enumeration
            if (user == null)
            {
                return Ok(new { message = "If an account with that email exists, password reset instructions have been sent." });
            }

            // Generate cryptographically secure token
            var tokenBytes = RandomNumberGenerator.GetBytes(32);
            var clearTextToken = Convert.ToBase64String(tokenBytes);
            var tokenHash = HashToken(clearTextToken);

            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                TokenHash = tokenHash,
                ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(30), // 30 mins expiration
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.PasswordResetTokens.Add(resetToken);
            await _context.SaveChangesAsync(default);

#if DEBUG
            // SAFE FOR DEV ONLY: Return the token in a custom header to easily retrieve it for testing
            Response.Headers.Append("X-Debug-Reset-Token", clearTextToken);
#endif

            return Ok(new { message = "If an account with that email exists, password reset instructions have been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new { error = "Email, Token, and New Password are required." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return BadRequest(new { error = "Invalid token or email." });

            var tokenHash = HashToken(request.Token);
            var resetToken = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.UserId == user.Id && t.TokenHash == tokenHash);

            if (resetToken == null) return BadRequest(new { error = "Invalid token or email." });
            
            if (resetToken.UsedAt != null) return BadRequest(new { error = "Token has already been used." });
            
            if (resetToken.ExpiresAt < DateTimeOffset.UtcNow) return BadRequest(new { error = "Token has expired." });

            // Proceed with password reset
            user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
            resetToken.UsedAt = DateTimeOffset.UtcNow; // Mark token as used

            await _context.SaveChangesAsync(default);

            return Ok(new { message = "Password successfully reset. You can now login." });
        }

        private static string HashToken(string token)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(token);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }
}
