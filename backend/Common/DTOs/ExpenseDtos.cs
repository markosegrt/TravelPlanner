using Common.Enums;

namespace Common.DTOs
{
    public class ExpenseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ExpenseCategory Category { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string? Description { get; set; }
        public int TripId { get; set; }
    }

    public class CreateExpenseDto
    {
        public string Name { get; set; } = string.Empty;
        public ExpenseCategory Category { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateExpenseDto
    {
        public string Name { get; set; } = string.Empty;
        public ExpenseCategory Category { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string? Description { get; set; }
    }

    public class BudgetSummaryDto
    {
        public decimal PlannedBudget { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal Remaining { get; set; }
    }
}