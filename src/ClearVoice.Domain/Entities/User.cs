using System;

namespace ClearVoice.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "FinanceUser";
        public bool EmailVerified { get; set; } = false;
        public string Status { get; set; } = "pending";
        public DateTimeOffset CreatedAt { get; set; }

        public Tenant? Tenant { get; set; }
    }
}
