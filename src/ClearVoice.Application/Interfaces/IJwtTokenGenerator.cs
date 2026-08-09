using ClearVoice.Domain.Entities;

namespace ClearVoice.Application.Interfaces
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
        string GenerateRefreshToken();
    }
}
