using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using ClearVoice.Application.Interfaces;
using ClearVoice.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClearVoice.Infrastructure.Services
{
    public class ApiKeyService : IApiKeyService
    {
        private const string Prefix = "cv_live_";
        private readonly IClearVoiceDbContext _context;

        public ApiKeyService(IClearVoiceDbContext context)
        {
            _context = context;
        }

        public (string ClearTextKey, ApiKey ApiKeyEntity) GenerateApiKey(Guid tenantId, string name)
        {
            // Generate 32 bytes of cryptographic randomness
            var keyBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(keyBytes);
            }
            
            // Base64Url encode it (remove padding, replace + with -, / with _)
            var randomString = Convert.ToBase64String(keyBytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');

            var clearTextKey = Prefix + randomString;
            
            // Extract the first 12 chars to use as a prefix for easy identification
            var keyPrefix = clearTextKey.Substring(0, 12);
            
            // Hash the key for storage using SHA-256
            var keyHash = HashApiKey(clearTextKey);

            var apiKeyEntity = new ApiKey
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = name,
                KeyHash = keyHash,
                KeyPrefix = keyPrefix,
                CreatedAt = DateTimeOffset.UtcNow,
                LastUsedAt = null,
                IsActive = true
            };

            return (clearTextKey, apiKeyEntity);
        }

        public async Task<ApiKey?> ValidateApiKeyAsync(string clearTextKey)
        {
            if (string.IsNullOrWhiteSpace(clearTextKey) || !clearTextKey.StartsWith(Prefix))
            {
                return null;
            }

            var hash = HashApiKey(clearTextKey);

            // Fetch the API key that matches the hash
            var apiKey = await _context.ApiKeys.FirstOrDefaultAsync(k => k.KeyHash == hash && k.IsActive);
            
            if (apiKey != null)
            {
                // Update LastUsedAt. In a high-throughput system, you might want to batch this or use Redis.
                apiKey.LastUsedAt = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync(default);
            }

            return apiKey;
        }

        private static string HashApiKey(string clearTextKey)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(clearTextKey);
            var hashBytes = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hashBytes);
        }
    }
}
