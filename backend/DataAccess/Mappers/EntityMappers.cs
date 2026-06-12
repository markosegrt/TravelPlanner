using Common.DTOs;
using DataAccess.Entities;
using Common.Enums;

namespace DataAccess.Mappers
{
    public static class EntityMappers
    {
        public static UserDto ToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.ToString(),
                IsActive = user.IsActive
            };
        }

        public static TripDto ToTripDto(Trip trip, int destinationCount = 0, decimal totalSpent = 0)
        {
            return new TripDto
            {
                Id = trip.Id,
                Name = trip.Name,
                Description = trip.Description,
                StartDate = trip.StartDate,
                EndDate = trip.EndDate,
                PlannedBudget = trip.PlannedBudget,
                GeneralNotes = trip.GeneralNotes,
                DestinationCount = destinationCount,
                TotalSpent = totalSpent
            };
        }

        public static TripDetailDto ToTripDetailDto(
            Trip trip,
            List<DestinationDto> destinations,
            List<ActivityDto> activities,
            List<ExpenseDto> expenses,
            List<ChecklistItemDto> checklistItems,
            BudgetSummaryDto budgetSummary)
        {
            return new TripDetailDto
            {
                Id = trip.Id,
                Name = trip.Name,
                Description = trip.Description,
                StartDate = trip.StartDate,
                EndDate = trip.EndDate,
                PlannedBudget = trip.PlannedBudget,
                GeneralNotes = trip.GeneralNotes,
                OwnerUserId = trip.OwnerUserId,
                Destinations = destinations,
                Activities = activities,
                Expenses = expenses,
                ChecklistItems = checklistItems,
                BudgetSummary = budgetSummary
            };
        }

        public static DestinationDto ToDestinationDto(Destination d)
        {
            return new DestinationDto
            {
                Id = d.Id,
                Name = d.Name,
                Location = d.Location,
                ArrivalDate = d.ArrivalDate,
                DepartureDate = d.DepartureDate,
                Notes = d.Notes,
                Latitude = d.Latitude,
                Longitude = d.Longitude,
                TripId = d.TripId
            };
        }

        public static ActivityDto ToActivityDto(Activity a)
        {
            return new ActivityDto
            {
                Id = a.Id,
                Name = a.Name,
                Date = a.Date,
                Time = a.Time,
                Location = a.Location,
                Description = a.Description,
                EstimatedCost = a.EstimatedCost,
                Status = a.Status,
                Latitude = a.Latitude,
                Longitude = a.Longitude,
                TripId = a.TripId,
                DestinationId = a.DestinationId
            };
        }

        public static ExpenseDto ToExpenseDto(Expense e)
        {
            return new ExpenseDto
            {
                Id = e.Id,
                Name = e.Name,
                Category = e.Category,
                Amount = e.Amount,
                Date = e.Date,
                Description = e.Description,
                TripId = e.TripId
            };
        }

        public static ChecklistItemDto ToChecklistItemDto(ChecklistItem c)
        {
            return new ChecklistItemDto
            {
                Id = c.Id,
                Name = c.Name,
                IsCompleted = c.IsCompleted,
                TripId = c.TripId
            };
        }

        public static BudgetSummaryDto ToBudgetSummaryDto(decimal plannedBudget, decimal totalSpent)
        {
            return new BudgetSummaryDto
            {
                PlannedBudget = plannedBudget,
                TotalSpent = totalSpent,
                Remaining = plannedBudget - totalSpent
            };
        }

        public static ShareTokenDto ToShareTokenDto(ShareToken s)
        {
            return new ShareTokenDto
            {
                Id = s.Id,
                Token = s.Token,
                TripId = s.TripId,
                AccessLevel = s.AccessLevel,
                ExpiresAt = s.ExpiresAt
            };
        }
    }
}