namespace Common.DTOs
{
    public class TripDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal PlannedBudget { get; set; }
        public string? GeneralNotes { get; set; }
        public int DestinationCount { get; set; }
        public decimal TotalSpent { get; set; }
    }

    public class TripDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal PlannedBudget { get; set; }
        public string? GeneralNotes { get; set; }
        public int OwnerUserId { get; set; }
        public List<DestinationDto> Destinations { get; set; } = [];
        public List<ActivityDto> Activities { get; set; } = [];
        public List<ExpenseDto> Expenses { get; set; } = [];
        public List<ChecklistItemDto> ChecklistItems { get; set; } = [];
        public BudgetSummaryDto BudgetSummary { get; set; } = null!;
    }

    public class CreateTripDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal PlannedBudget { get; set; }
        public string? GeneralNotes { get; set; }
    }

    public class UpdateTripDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal PlannedBudget { get; set; }
        public string? GeneralNotes { get; set; }
    }

    public class AdminTripDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal PlannedBudget { get; set; }
        public decimal TotalSpent { get; set; }
        public int DestinationCount { get; set; }
        public int OwnerUserId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public string OwnerEmail { get; set; } = string.Empty;
    }
}