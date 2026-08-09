using System;

namespace ClearVoice.Domain.Entities
{
    public class OutboxMessage
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Payload { get; set; } = string.Empty;
        public string Status { get; set; } = "pending";
        public int Attempts { get; set; } = 0;
        public DateTimeOffset NextAttemptAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
