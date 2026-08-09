using System;

namespace ClearVoice.Domain.Entities
{
    public class ClearanceAttempt
    {
        public Guid Id { get; set; }
        public Guid InvoiceId { get; set; }
        public Guid AttemptUuid { get; set; }
        public DateTimeOffset SubmittedAt { get; set; }
        public string? ResponseCode { get; set; }
        public bool Success { get; set; }
        public string? ErrorDetail { get; set; }
        public string? RawResponse { get; set; }

        public Invoice? Invoice { get; set; }
    }
}
