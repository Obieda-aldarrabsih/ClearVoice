using System.Threading;
using System.Threading.Tasks;
using ClearVoice.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClearVoice.Application.Interfaces
{
    public interface IClearVoiceDbContext
    {
        DbSet<Tenant> Tenants { get; }
        DbSet<User> Users { get; }
        DbSet<ApiKey> ApiKeys { get; }
        DbSet<Invoice> Invoices { get; }
        DbSet<InvoiceLine> InvoiceLines { get; }
        DbSet<ClearanceAttempt> ClearanceAttempts { get; }
        DbSet<OutboxMessage> OutboxMessages { get; }
        DbSet<WebhookEndpoint> WebhookEndpoints { get; }
        DbSet<WebhookDelivery> WebhookDeliveries { get; }
        DbSet<AuditLog> AuditLogs { get; }
        DbSet<PasswordResetToken> PasswordResetTokens { get; }
        DbSet<AccessRequest> AccessRequests { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
