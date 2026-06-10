using Common.Enums;

namespace Common.DTOs
{
    public class CreateShareDto
    {
        public AccessLevel AccessLevel { get; set; }
    }

    public class ShareResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public AccessLevel AccessLevel { get; set; }
        public string ShareUrl { get; set; } = string.Empty;
        public string QrCodeBase64 { get; set; } = string.Empty;
    }

    public class SharedPlanDto
    {
        public AccessLevel AccessLevel { get; set; }
        public TripDetailDto Trip { get; set; } = null!;
    }
}