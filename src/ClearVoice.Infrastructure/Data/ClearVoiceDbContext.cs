using System;
using ClearVoice.Application.Interfaces;
using ClearVoice.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClearVoice.Infrastructure.Data
{
    public class ClearVoiceDbContext : DbContext, IClearVoiceDbContext
    {
        private readonly ITenantProvider? _tenantProvider;

        public ClearVoiceDbContext(DbContextOptions<ClearVoiceDbContext> options, ITenantProvider? tenantProvider = null)
            : base(options)
        {
            _tenantProvider = tenantProvider;
        }

        public DbSet<Tenant> Tenants { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<ApiKey> ApiKeys { get; set; } = null!;
        public DbSet<Invoice> Invoices { get; set; } = null!;
        public DbSet<InvoiceLine> InvoiceLines { get; set; } = null!;
        public DbSet<ClearanceAttempt> ClearanceAttempts { get; set; } = null!;
        public DbSet<OutboxMessage> OutboxMessages { get; set; } = null!;
        public DbSet<WebhookEndpoint> WebhookEndpoints { get; set; } = null!;
        public DbSet<WebhookDelivery> WebhookDeliveries { get; set; } = null!;
        public DbSet<AuditLog> AuditLogs { get; set; } = null!;
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; } = null!;
        public DbSet<AccessRequest> AccessRequests { get; set; } = null!;

        public Guid? CurrentTenantId => _tenantProvider?.GetTenantId();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Tenant>(b =>

            {
                b.ToTable("tenants");
                b.HasKey(t => t.Id);
                b.Property(t => t.LegalName).IsRequired().HasMaxLength(255);
                b.Property(t => t.TaxId).IsRequired().HasMaxLength(50);
                b.HasIndex(t => t.TaxId).IsUnique();
                b.Property(t => t.Address).HasMaxLength(500);
                b.Property(t => t.City).HasMaxLength(100);
                b.Property(t => t.Country).HasMaxLength(100);
                b.Property(t => t.Phone).HasMaxLength(50);
                b.Property(t => t.Industry).HasMaxLength(100);
                b.Property(t => t.Website).HasMaxLength(255);
                b.Property(t => t.DefaultCurrency).HasDefaultValue("JOD").HasMaxLength(3);
                b.Property(t => t.Plan).HasDefaultValue("trial").HasMaxLength(20);
            });

            modelBuilder.Entity<User>(b =>
            {
                b.ToTable("users");
                b.HasKey(u => u.Id);
                b.Property(u => u.Email).IsRequired().HasMaxLength(255);
                b.Property(u => u.FullName).IsRequired().HasMaxLength(255).HasDefaultValue("");
                b.HasIndex(u => u.Email).IsUnique();
                b.Property(u => u.Role).IsRequired().HasMaxLength(20);
                b.Property(u => u.Status).HasDefaultValue("pending").HasMaxLength(20);
                b.HasIndex(u => new { u.TenantId, u.Email });
                b.HasQueryFilter(u => CurrentTenantId == null || u.TenantId == CurrentTenantId);
            });

            modelBuilder.Entity<ApiKey>(b =>
            {
                b.ToTable("api_keys");
                b.HasKey(k => k.Id);
                b.Property(k => k.Name).IsRequired().HasMaxLength(100);
                b.Property(k => k.KeyHash).IsRequired().HasMaxLength(255);
                b.Property(k => k.KeyPrefix).IsRequired().HasMaxLength(12);
                b.HasQueryFilter(k => CurrentTenantId == null || k.TenantId == CurrentTenantId);
            });

            modelBuilder.Entity<Invoice>(b =>
            {
                b.ToTable("invoices");
                b.HasKey(i => i.Id);
                b.Property(i => i.ExternalRef).HasMaxLength(100);
                b.Property(i => i.BuyerName).HasMaxLength(255);
                b.Property(i => i.BuyerTaxId).HasMaxLength(50);
                b.Property(i => i.SellerSnapshot).HasColumnType("jsonb").IsRequired();
                b.Property(i => i.Currency).IsRequired().HasMaxLength(3);
                b.Property(i => i.Subtotal).HasColumnType("numeric(14,3)");
                b.Property(i => i.TaxTotal).HasColumnType("numeric(14,3)");
                b.Property(i => i.GrandTotal).HasColumnType("numeric(14,3)");
                b.Property(i => i.Status).IsRequired().HasMaxLength(20);
                b.Property(i => i.UblDocumentRef).HasMaxLength(255);
                b.Property(i => i.PdfRef).HasMaxLength(255);
                b.HasIndex(i => new { i.TenantId, i.Status });
                b.HasIndex(i => new { i.TenantId, i.CreatedAt });
                b.HasQueryFilter(i => CurrentTenantId == null || i.TenantId == CurrentTenantId);
            });

            modelBuilder.Entity<InvoiceLine>(b =>
            {
                b.ToTable("invoice_lines");
                b.HasKey(il => il.Id);
                b.Property(il => il.Description).IsRequired().HasMaxLength(500);
                b.Property(il => il.Quantity).HasColumnType("numeric(10,3)");
                b.Property(il => il.UnitPrice).HasColumnType("numeric(14,3)");
                b.Property(il => il.TaxRate).HasColumnType("numeric(5,2)");
                b.Property(il => il.LineTotal).HasColumnType("numeric(14,3)");
            });

            modelBuilder.Entity<ClearanceAttempt>(b =>
            {
                b.ToTable("clearance_attempts");
                b.HasKey(ca => ca.Id);
                b.HasIndex(ca => ca.AttemptUuid).IsUnique();
                b.Property(ca => ca.ResponseCode).HasMaxLength(20);
                b.Property(ca => ca.RawResponse).HasColumnType("jsonb");
            });

            modelBuilder.Entity<OutboxMessage>(b =>
            {
                b.ToTable("outbox_messages");
                b.HasKey(om => om.Id);
                b.Property(om => om.Type).IsRequired().HasMaxLength(50);
                b.Property(om => om.Payload).HasColumnType("jsonb").IsRequired();
                b.Property(om => om.Status).HasDefaultValue("pending").HasMaxLength(20);
            });

            modelBuilder.Entity<WebhookEndpoint>(b =>
            {
                b.ToTable("webhook_endpoints");
                b.HasKey(w => w.Id);
                b.Property(w => w.Url).IsRequired().HasMaxLength(500);
                b.Property(w => w.SigningSecret).IsRequired().HasMaxLength(255);
                b.HasQueryFilter(w => CurrentTenantId == null || w.TenantId == CurrentTenantId);
            });

            modelBuilder.Entity<WebhookDelivery>(b =>
            {
                b.ToTable("webhook_deliveries");
                b.HasKey(wd => wd.Id);
                b.Property(wd => wd.EventType).IsRequired().HasMaxLength(50);
                b.Property(wd => wd.Payload).HasColumnType("jsonb").IsRequired();
            });

            modelBuilder.Entity<AuditLog>(b =>
            {
                b.ToTable("audit_logs");
                b.HasKey(a => a.Id);
                b.Property(a => a.Action).IsRequired().HasMaxLength(100);
                b.Property(a => a.EntityType).IsRequired().HasMaxLength(50);
                b.Property(a => a.BeforeState).HasColumnType("jsonb");
                b.Property(a => a.AfterState).HasColumnType("jsonb");
                b.HasIndex(a => a.CreatedAt);
                b.HasQueryFilter(a => CurrentTenantId == null || a.TenantId == CurrentTenantId);
            });

            modelBuilder.Entity<PasswordResetToken>(b =>
            {
                b.ToTable("password_reset_tokens");
                b.HasKey(t => t.Id);
                b.Property(t => t.TokenHash).IsRequired().HasMaxLength(255);
                b.HasIndex(t => t.TokenHash);
            });

            modelBuilder.Entity<AccessRequest>(b =>
            {
                b.ToTable("access_requests");
                b.HasKey(a => a.Id);
                b.Property(a => a.FullName).IsRequired().HasMaxLength(255);
                b.Property(a => a.Email).IsRequired().HasMaxLength(255);
                b.Property(a => a.OrganizationName).IsRequired().HasMaxLength(255);
                b.Property(a => a.Message).HasMaxLength(1000);
                b.Property(a => a.Status).IsRequired().HasMaxLength(20);
            });
        }
    }
}
