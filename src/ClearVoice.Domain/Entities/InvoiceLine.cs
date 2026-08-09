using System;

namespace ClearVoice.Domain.Entities
{
    public class InvoiceLine
    {
        public Guid Id { get; set; }
        public Guid InvoiceId { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TaxRate { get; set; }
        public decimal LineTotal { get; set; }

        public Invoice? Invoice { get; set; }
    }
}
