using System;

namespace ClearVoice.Domain.Entities
{
    public class WebhookDelivery
    {
        public Guid Id { get; set; }
        public Guid EndpointId { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string Payload { get; set; } = string.Empty;
        public int? ResponseStatus { get; set; }
        public DateTimeOffset? DeliveredAt { get; set; }
        public int AttemptCount { get; set; } = 0;

        public WebhookEndpoint? Endpoint { get; set; }
    }
}
