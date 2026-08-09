using System;
using System.Threading.Tasks;
using ClearVoice.Application.Invoices.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClearVoice.Api.Controllers
{
    [ApiController]
    [Route("api/v1/invoices")]
    [Authorize]
    public class InvoicesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public InvoicesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitInvoice([FromBody] SubmitInvoiceCommand command)
        {
            var invoiceId = await _mediator.Send(command);
            return Accepted(new { data = new { invoiceId = invoiceId, status = "SUBMITTED" }, error = (string?)null });
        }
    }
}
