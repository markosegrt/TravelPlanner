namespace Common.DTOs
{
    public class ChecklistItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public int TripId { get; set; }
    }

    public class CreateChecklistItemDto
    {
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateChecklistItemDto
    {
        public string Name { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
    }
}