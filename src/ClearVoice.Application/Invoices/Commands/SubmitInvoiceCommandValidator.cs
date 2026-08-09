using FluentValidation;

namespace ClearVoice.Application.Invoices.Commands
{
    public class SubmitInvoiceCommandValidator : AbstractValidator<SubmitInvoiceCommand>
    {
        public SubmitInvoiceCommandValidator()
        {
            RuleFor(v => v.Currency).NotEmpty().Length(3);
            RuleFor(v => v.Lines).NotEmpty();
            RuleForEach(v => v.Lines).ChildRules(line =>
            {
                line.RuleFor(l => l.Description).NotEmpty();
                line.RuleFor(l => l.Quantity).GreaterThan(0);
                line.RuleFor(l => l.UnitPrice).GreaterThanOrEqualTo(0);
                line.RuleFor(l => l.TaxRate).GreaterThanOrEqualTo(0);
            });
        }
    }
}
