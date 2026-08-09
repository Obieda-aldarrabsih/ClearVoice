using System;
using System.Collections.Generic;

namespace ClearVoice.Domain.Entities
{
    public class Invoice
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string? ExternalRef { get; set; }
        public string? BuyerName { get; set; }
        public string? BuyerTaxId { get; set; }
        public string SellerSnapshot { get; set; } = "{}";
        public string Currency { get; set; } = "JOD";
        public decimal Subtotal { get; set; }
        public decimal TaxTotal { get; set; }
        public decimal GrandTotal { get; set; }
        public string Status { get; set; } = "DRAFT";
        public string? UblDocumentRef { get; set; }
        public string? QrPayload { get; set; }
        public string? PdfRef { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? ClearedAt { get; set; }

        public Tenant? Tenant { get; set; }
        public ICollection<InvoiceLine> InvoiceLines { get; set; } = new List<InvoiceLine>();
        public ICollection<ClearanceAttempt> ClearanceAttempts { get; set; } = new List<ClearanceAttempt>();
    }
}
