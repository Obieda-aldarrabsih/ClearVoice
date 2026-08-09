using System;
using System.Collections.Generic;
using MediatR;

namespace ClearVoice.Application.Invoices.Commands
{
    public class SubmitInvoiceCommand : IRequest<Guid>
    {
        public string? ExternalRef { get; set; }
        public string? BuyerName { get; set; }
        public string? BuyerTaxId { get; set; }
        public string Currency { get; set; } = "JOD";
        public List<InvoiceLineDto> Lines { get; set; } = new();
    }

    public class InvoiceLineDto
    {
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TaxRate { get; set; }
    }
}
