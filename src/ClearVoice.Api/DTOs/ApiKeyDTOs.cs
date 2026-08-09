namespace ClearVoice.Api.DTOs
{
    public class GenerateApiKeyRequest
    {
        public string Name { get; set; } = string.Empty;
    }

    public class GenerateApiKeyResponse
    {
        public string Name { get; set; } = string.Empty;
        public string ClearTextKey { get; set; } = string.Empty;
        public string Warning { get; set; } = "Please copy this key now. It will never be shown again.";
    }
}
