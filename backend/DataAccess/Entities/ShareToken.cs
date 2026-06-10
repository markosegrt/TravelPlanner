using DataAccess.Enums;

namespace DataAccess.Entities
{
    public class ShareToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = Guid.NewGuid().ToString();
        public int TripId { get; set; }
        public AccessLevel AccessLevel { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Trip Trip { get; set; } = null!;
    }
}