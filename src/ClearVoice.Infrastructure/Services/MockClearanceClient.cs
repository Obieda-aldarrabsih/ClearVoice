using System;
using System.Threading.Tasks;
using ClearVoice.Application.Interfaces;

namespace ClearVoice.Infrastructure.Services
{
    public class MockClearanceClient : IClearanceClient
    {
        public Task<(bool Success, string? ResponseCode, string? ErrorDetail, string RawResponse, string? QrPayload)> SubmitAsync(string ublXml)
        {
            // Simulate clearance service success for MVP
            return Task.FromResult((
                Success: true,
                ResponseCode: "200",
                ErrorDetail: (string?)null,
                RawResponse: "{\"status\":\"cleared\"}",
                QrPayload: "dummy_qr_payload_for_" + Guid.NewGuid().ToString()
            ));
        }
    }
}
