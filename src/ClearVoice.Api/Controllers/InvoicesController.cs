using System;
using System.Threading.Tasks;
using System.Linq;
using ClearVoice.Application.Interfaces;
using ClearVoice.Application.Invoices.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClearVoice.Api.Controllers
{
    [ApiController]
    [Route("api/v1/invoices")]
    [Authorize(Policy = "CanSubmitInvoices")]
    public class InvoicesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IClearVoiceDbContext _context;
        private readonly ITenantProvider _tenantProvider;

        public InvoicesController(IMediator mediator, IClearVoiceDbContext context, ITenantProvider tenantProvider)
        {
            _mediator = mediator;
            _context = context;
            _tenantProvider = tenantProvider;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitInvoice([FromBody] SubmitInvoiceCommand command)
        {
            var invoiceId = await _mediator.Send(command);
            return Accepted(new { data = new { invoiceId = invoiceId, status = "SUBMITTED" }, error = (string?)null });
        }

        [HttpGet]
        public async Task<IActionResult> GetInvoices(
            [FromQuery] string? search,
            [FromQuery] string? status,
            [FromQuery] DateTimeOffset? startDate,
            [FromQuery] DateTimeOffset? endDate,
            [FromQuery] string? sortBy,
            [FromQuery] bool sortDesc = true,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var query = _context.Invoices.Where(i => i.TenantId == tenantId.Value);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(i => 
                    (i.ExternalRef != null && i.ExternalRef.ToLower().Contains(lowerSearch)) ||
                    (i.BuyerName != null && i.BuyerName.ToLower().Contains(lowerSearch)) ||
                    (i.BuyerTaxId != null && i.BuyerTaxId.ToLower().Contains(lowerSearch)));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(i => i.Status == status.ToUpper());
            }

            if (startDate.HasValue)
            {
                query = query.Where(i => i.CreatedAt >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(i => i.CreatedAt <= endDate.Value);
            }

            // Sorting
            if (!string.IsNullOrWhiteSpace(sortBy))
            {
                query = sortBy.ToLower() switch
                {
                    "date" => sortDesc ? query.OrderByDescending(i => i.CreatedAt) : query.OrderBy(i => i.CreatedAt),
                    "amount" => sortDesc ? query.OrderByDescending(i => i.GrandTotal) : query.OrderBy(i => i.GrandTotal),
                    "status" => sortDesc ? query.OrderByDescending(i => i.Status) : query.OrderBy(i => i.Status),
                    "buyer" => sortDesc ? query.OrderByDescending(i => i.BuyerName) : query.OrderBy(i => i.BuyerName),
                    "reference" => sortDesc ? query.OrderByDescending(i => i.ExternalRef) : query.OrderBy(i => i.ExternalRef),
                    _ => sortDesc ? query.OrderByDescending(i => i.CreatedAt) : query.OrderBy(i => i.CreatedAt),
                };
            }
            else
            {
                query = sortDesc ? query.OrderByDescending(i => i.CreatedAt) : query.OrderBy(i => i.CreatedAt);
            }

            var totalCount = await query.CountAsync();

            var invoices = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(i => new {
                    id = i.Id,
                    ExternalRef = i.ExternalRef,
                    BuyerName = i.BuyerName,
                    IssueDate = i.CreatedAt,
                    TotalAmount = i.GrandTotal, // Always return tax-inclusive total
                    Status = i.Status,
                    RejectionReason = i.ClearanceAttempts.OrderByDescending(c => c.SubmittedAt).Select(c => c.ErrorDetail).FirstOrDefault()
                })
                .ToListAsync();

            return Ok(new { 
                data = invoices,
                meta = new {
                    total = totalCount,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInvoice(Guid id)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var invoice = await _context.Invoices
                .Include(i => i.InvoiceLines)
                .Include(i => i.ClearanceAttempts)
                .FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId.Value);

            if (invoice == null) return NotFound();

            var clearance = invoice.ClearanceAttempts.OrderByDescending(c => c.SubmittedAt).FirstOrDefault();

            return Ok(new { data = new {
                id = invoice.Id,
                internalReference = invoice.ExternalRef,
                issueDate = invoice.CreatedAt,
                buyerName = invoice.BuyerName,
                buyerTaxId = invoice.BuyerTaxId,
                status = invoice.Status,
                joSecInvoiceId = clearance?.AttemptUuid.ToString(),
                clearanceDate = invoice.ClearedAt,
                subtotal = invoice.Subtotal,
                taxTotal = invoice.TaxTotal,
                totalAmount = invoice.GrandTotal,
                rejectionReason = clearance?.Success == false ? clearance.ErrorDetail : null,
                lines = invoice.InvoiceLines.Select(l => new {
                    itemName = l.Description,
                    quantity = l.Quantity,
                    unitPrice = l.UnitPrice,
                    lineTotal = l.LineTotal
                })
            }});
        }

        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> DownloadPdf(Guid id)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId.Value);
            if (invoice == null) return NotFound();

            // Simulate PDF generation
            var pdfBytes = System.Text.Encoding.UTF8.GetBytes("%PDF-1.4\n%Simulated PDF Content\n...");
            return File(pdfBytes, "application/pdf", $"invoice-{invoice.ExternalRef ?? invoice.Id.ToString()}.pdf");
        }

        [HttpGet("{id}/ubl")]
        public async Task<IActionResult> DownloadUbl(Guid id)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tenantId.Value);
            if (invoice == null) return NotFound();

            // Simulate XML generation
            var xmlContent = $"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Invoice><ID>{invoice.ExternalRef}</ID></Invoice>";
            var xmlBytes = System.Text.Encoding.UTF8.GetBytes(xmlContent);
            return File(xmlBytes, "application/xml", $"invoice-{invoice.ExternalRef ?? invoice.Id.ToString()}.xml");
        }
    }
}
