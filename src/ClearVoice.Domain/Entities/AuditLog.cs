using System;

namespace ClearVoice.Domain.Entities
{
    public class AuditLog
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid? ActorUserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public Guid EntityId { get; set; }
        public string? BeforeState { get; set; }
        public string? AfterState { get; set; }
        public DateTimeOffset CreatedAt { get; set; }

        public Tenant? Tenant { get; set; }
    }
}
