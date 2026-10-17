using System;
using System.Collections.Generic;

namespace ClearVoice.Domain.Entities
{
    public class Tenant
    {
        public Guid Id { get; set; }
        public string LegalName { get; set; } = string.Empty;
        public string TaxId { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
        public string? Industry { get; set; }
        public string? Website { get; set; }
        public string DefaultCurrency { get; set; } = "JOD";
        public string Plan { get; set; } = "trial";
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? DeactivatedAt { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<ApiKey> ApiKeys { get; set; } = new List<ApiKey>();
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
        public ICollection<WebhookEndpoint> WebhookEndpoints { get; set; } = new List<WebhookEndpoint>();
        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}
