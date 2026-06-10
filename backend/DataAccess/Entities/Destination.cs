using System.Diagnostics;

namespace DataAccess.Entities
{
    public class Destination
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime ArrivalDate { get; set; }
        public DateTime DepartureDate { get; set; }
        public string? Notes { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public int TripId { get; set; }
        
        public Trip Trip { get; set; } = null!;
        public ICollection<Activity> Activities { get; set; } = new List<Activity>();
    }
}