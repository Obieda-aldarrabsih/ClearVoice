using System;

namespace ClearVoice.Application.Interfaces
{
    public interface ITenantProvider
    {
        Guid? GetTenantId();
    }
}
