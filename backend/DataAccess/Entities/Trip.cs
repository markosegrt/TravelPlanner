using System.Diagnostics;

namespace DataAccess.Entities
{
    public class Trip
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal PlannedBudget { get; set; }
        public string? GeneralNotes { get; set; }
        public int OwnerUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User Owner { get; set; } = null!;
        public ICollection<Destination> Destinations { get; set; } = [];
        public ICollection<Activity> Activities { get; set; } = [];
        public ICollection<Expense> Expenses { get; set; } = [];
        public ICollection<ChecklistItem> ChecklistItems { get; set; } = [];
        public ICollection<ShareToken> ShareTokens { get; set; } = [];
    }
}