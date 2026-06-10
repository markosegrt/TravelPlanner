using DataAccess.Enums;

namespace DataAccess.Entities
{
    public class Expense
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ExpenseCategory Category { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string? Description { get; set; }
        public int TripId { get; set; }

        // Navigation
        public Trip Trip { get; set; } = null!;
    }
}