using System.Threading.Tasks;

namespace ClearVoice.Application.Interfaces
{
    public interface IClearanceClient
    {
        Task<(bool Success, string? ResponseCode, string? ErrorDetail, string RawResponse, string? QrPayload)> SubmitAsync(string ublXml);
    }
}
