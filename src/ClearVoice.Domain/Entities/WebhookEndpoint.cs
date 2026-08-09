using System;
using System.Collections.Generic;

namespace ClearVoice.Domain.Entities
{
    public class WebhookEndpoint
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string Url { get; set; } = string.Empty;
        public string SigningSecret { get; set; } = string.Empty;
        public string[] SubscribedEvents { get; set; } = Array.Empty<string>();
        public bool Active { get; set; } = true;

        public Tenant? Tenant { get; set; }
        public ICollection<WebhookDelivery> WebhookDeliveries { get; set; } = new List<WebhookDelivery>();
    }
}
