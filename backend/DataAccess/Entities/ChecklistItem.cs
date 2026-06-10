namespace DataAccess.Entities
{
    public class ChecklistItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;
        public int TripId { get; set; }

        // Navigation
        public Trip Trip { get; set; } = null!;
    }
}