using System;

namespace ClearVoice.Domain.Entities
{
    public class AccessRequest
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string OrganizationName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public DateTimeOffset CreatedAt { get; set; }
    }
}
