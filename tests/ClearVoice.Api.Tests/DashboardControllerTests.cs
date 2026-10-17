using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClearVoice.Api.Controllers;
using ClearVoice.Application.Interfaces;
using ClearVoice.Domain.Entities;
using ClearVoice.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ClearVoice.Api.Tests
{
    public class DashboardControllerTests
    {
        private readonly ClearVoiceDbContext _context;
        private readonly Mock<ITenantProvider> _tenantProviderMock;
        private readonly Guid _tenantId = Guid.NewGuid();

        public DashboardControllerTests()
        {
            var options = new DbContextOptionsBuilder<ClearVoiceDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _tenantProviderMock = new Mock<ITenantProvider>();
            _tenantProviderMock.Setup(t => t.GetTenantId()).Returns(_tenantId);

            _context = new ClearVoiceDbContext(options, _tenantProviderMock.Object);
        }

        [Fact]
        public async Task GetStats_ShouldReturnAggregatedData()
        {
            // Arrange
            _context.Tenants.Add(new Tenant { Id = _tenantId, LegalName = "Test Tenant", TaxId = "123" });
            
            _context.Invoices.AddRange(new List<Invoice>
            {
                new Invoice { Id = Guid.NewGuid(), TenantId = _tenantId, Status = "CLEARED", GrandTotal = 1000m, CreatedAt = DateTimeOffset.UtcNow.AddDays(-5) },
                new Invoice { Id = Guid.NewGuid(), TenantId = _tenantId, Status = "PENDING", GrandTotal = 500m, CreatedAt = DateTimeOffset.UtcNow.AddDays(-10) },
                new Invoice { Id = Guid.NewGuid(), TenantId = _tenantId, Status = "CLEARED", GrandTotal = 2000m, CreatedAt = DateTimeOffset.UtcNow.AddDays(-15) },
                new Invoice { Id = Guid.NewGuid(), TenantId = _tenantId, Status = "FAILED", GrandTotal = 250m, CreatedAt = DateTimeOffset.UtcNow.AddDays(-2) },
                new Invoice { Id = Guid.NewGuid(), TenantId = Guid.NewGuid(), Status = "CLEARED", GrandTotal = 10000m, CreatedAt = DateTimeOffset.UtcNow } // Other tenant
            });
            await _context.SaveChangesAsync();

            var controller = new DashboardController(_context, _tenantProviderMock.Object);

            // Act
            var result = await controller.GetStats("30d");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var data = (dynamic)okResult.Value!;
            var innerData = (dynamic)data.data;
            
            // Should only count for _tenantId
            Assert.Equal(4, innerData.totalInvoices);
            Assert.Equal(2, innerData.totalCleared);
            Assert.Equal(1, innerData.pending);
            Assert.Equal(1, innerData.failed);
            Assert.Equal(3000m, innerData.totalVolume);
            
            // Should have 5 or less recent invoices (4 total in db for this tenant)
            var recentInvoices = (IEnumerable<dynamic>)innerData.recentInvoices;
            Assert.Equal(4, recentInvoices.Count());
        }

        [Fact]
        public async Task GetStats_Unauthorized_WhenTenantIdIsNull()
        {
            // Arrange
            _tenantProviderMock.Setup(t => t.GetTenantId()).Returns((Guid?)null);
            var controller = new DashboardController(_context, _tenantProviderMock.Object);

            // Act
            var result = await controller.GetStats("30d");

            // Assert
            Assert.IsType<UnauthorizedResult>(result);
        }
    }
}
