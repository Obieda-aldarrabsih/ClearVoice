namespace ClearVoice.Api.DTOs
{
    public class RegisterWebhookRequest
    {
        public string Url { get; set; } = string.Empty;
        public string EventType { get; set; } = "InvoiceCleared";
    }

    public class WebhookResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string SigningSecret { get; set; } = string.Empty;
    }
}
