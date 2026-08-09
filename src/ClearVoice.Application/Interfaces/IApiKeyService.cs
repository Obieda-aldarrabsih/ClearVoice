using System;
using System.Threading.Tasks;
using ClearVoice.Domain.Entities;

namespace ClearVoice.Application.Interfaces
{
    public interface IApiKeyService
    {
        /// <summary>
        /// Generates a new API Key for a tenant. Returns the clear-text key (only visible once) and the entity to save.
        /// </summary>
        (string ClearTextKey, ApiKey ApiKeyEntity) GenerateApiKey(Guid tenantId, string name);
        
        /// <summary>
        /// Validates the provided clear-text API key against the database.
        /// </summary>
        Task<ApiKey?> ValidateApiKeyAsync(string clearTextKey);
    }
}
