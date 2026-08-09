using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using ClearVoice.Application.Interfaces;
using ClearVoice.Domain.Entities;
using MediatR;

namespace ClearVoice.Application.Invoices.Commands
{
    public class SubmitInvoiceCommandHandler : IRequestHandler<SubmitInvoiceCommand, Guid>
    {
        private readonly ITenantProvider _tenantProvider;
        private readonly IClearVoiceDbContext _context;

        public SubmitInvoiceCommandHandler(ITenantProvider tenantProvider, IClearVoiceDbContext context)
        {
            _tenantProvider = tenantProvider;
            _context = context;
        }

        public async Task<Guid> Handle(SubmitInvoiceCommand request, CancellationToken cancellationToken)
        {
            var tenantId = _tenantProvider.GetTenantId() ?? throw new UnauthorizedAccessException("No tenant context");

            var subtotal = request.Lines.Sum(l => l.Quantity * l.UnitPrice);
            var taxTotal = request.Lines.Sum(l => l.Quantity * l.UnitPrice * (l.TaxRate / 100m));
            var grandTotal = subtotal + taxTotal;

            var invoice = new Invoice
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ExternalRef = request.ExternalRef,
                BuyerName = request.BuyerName,
                BuyerTaxId = request.BuyerTaxId,
                SellerSnapshot = "{}", // To be populated from Tenant
                Currency = request.Currency,
                Subtotal = subtotal,
                TaxTotal = taxTotal,
                GrandTotal = grandTotal,
                Status = "SUBMITTED",
                CreatedAt = DateTimeOffset.UtcNow,
                InvoiceLines = request.Lines.Select(l => new InvoiceLine
                {
                    Id = Guid.NewGuid(),
                    Description = l.Description,
                    Quantity = l.Quantity,
                    UnitPrice = l.UnitPrice,
                    TaxRate = l.TaxRate,
                    LineTotal = (l.Quantity * l.UnitPrice) + (l.Quantity * l.UnitPrice * (l.TaxRate / 100m))
                }).ToList()
            };

            // In full implementation, we'd save to DB here, raise an event for Outbox worker, or call MockClearanceClient directly if async is omitted.
            // The architecture asks for Outbox pattern for submission to external service.
            var outboxMessage = new OutboxMessage
            {
                Id = Guid.NewGuid(),
                Type = "SubmitInvoice",
                Payload = JsonSerializer.Serialize(new { InvoiceId = invoice.Id }),
                CreatedAt = DateTimeOffset.UtcNow,
                NextAttemptAt = DateTimeOffset.UtcNow
            };

            _context.Invoices.Add(invoice);
            _context.OutboxMessages.Add(outboxMessage);
            await _context.SaveChangesAsync(cancellationToken);

            return invoice.Id;
        }
    }
}
