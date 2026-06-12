using Common.Enums;

namespace Common.DTOs
{
    public class ShareTokenDto
    {
        public int Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public int TripId { get; set; }
        public AccessLevel AccessLevel { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }
}