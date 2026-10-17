using System;
using System.Linq;
using System.Threading.Tasks;
using ClearVoice.Application.Interfaces;
using ClearVoice.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClearVoice.Api.Controllers
{
    [ApiController]
    [Route("api/v1/dashboard")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IClearVoiceDbContext _context;
        private readonly ITenantProvider _tenantProvider;

        public DashboardController(IClearVoiceDbContext context, ITenantProvider tenantProvider)
        {
            _context = context;
            _tenantProvider = tenantProvider;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats([FromQuery] string range = "30d")
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == null) return Unauthorized();

            var query = _context.Invoices.Where(i => i.TenantId == tenantId.Value);

            var cutoffDate = DateTimeOffset.UtcNow;
            switch (range.ToLower())
            {
                case "7d": cutoffDate = cutoffDate.AddDays(-7); break;
                case "30d": cutoffDate = cutoffDate.AddDays(-30); break;
                case "90d": cutoffDate = cutoffDate.AddDays(-90); break;
                case "ytd": cutoffDate = new DateTimeOffset(DateTime.UtcNow.Year, 1, 1, 0, 0, 0, TimeSpan.Zero); break;
                case "all": cutoffDate = DateTimeOffset.MinValue; break;
                default: cutoffDate = cutoffDate.AddDays(-30); break;
            }

            var totalInvoices = await query.Where(i => i.CreatedAt >= cutoffDate).CountAsync();
            var totalCleared = await query.Where(i => i.CreatedAt >= cutoffDate && i.Status == "CLEARED").CountAsync();
            var pending = await query.Where(i => i.CreatedAt >= cutoffDate && (i.Status == "PENDING" || i.Status == "SUBMITTED")).CountAsync();
            var failed = await query.Where(i => i.CreatedAt >= cutoffDate && (i.Status == "FAILED" || i.Status == "REJECTED")).CountAsync();
            var totalVolume = await query.Where(i => i.CreatedAt >= cutoffDate && i.Status == "CLEARED").SumAsync(i => i.GrandTotal);

            // Chart Data (Volume per day)
            // PostgreSQL date grouping - group in DB, then transform in memory
            var dbChartData = await query
                .Where(i => i.CreatedAt >= cutoffDate && i.Status == "CLEARED")
                .GroupBy(i => i.CreatedAt.Date)
                .Select(g => new { date = g.Key, volume = g.Sum(i => i.GrandTotal) })
                .ToListAsync();
                
            var chartData = dbChartData
                .Select(d => new { date = d.date.ToString("yyyy-MM-dd"), volume = d.volume })
                .OrderBy(d => d.date)
                .ToList();

            var recentInvoices = await query
                .Where(i => i.CreatedAt >= cutoffDate)
                .OrderByDescending(i => i.CreatedAt)
                .Take(5)
                .Select(i => new {
                    id = i.Id,
                    internalReference = i.ExternalRef,
                    buyerName = i.BuyerName,
                    issueDate = i.CreatedAt,
                    totalAmount = i.GrandTotal,
                    status = i.Status
                })
                .ToListAsync();

            return Ok(new
            {
                data = new
                {
                    totalInvoices,
                    totalCleared,
                    pending,
                    failed,
                    totalVolume,
                    chartData,
                    recentInvoices
                }
            });
        }
    }
}
