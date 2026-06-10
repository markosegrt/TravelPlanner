using Common.Enums;

namespace DataAccess.Entities
{
    public class Activity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public TimeSpan? Time { get; set; }
        public string? Location { get; set; }
        public string? Description { get; set; }
        public decimal EstimatedCost { get; set; }
        public ActivityStatus Status { get; set; } = ActivityStatus.Planned;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public int TripId { get; set; }
        public int? DestinationId { get; set; }

        // Navigation
        public Trip Trip { get; set; } = null!;
        public Destination? Destination { get; set; }
    }
}