using Microsoft.EntityFrameworkCore;
using DataAccess;
using DataAccess.Entities;

namespace BudgetService.Repositories
{
    public class ExpenseRepository
    {
        public async Task<List<Expense>> GetByTripAsync(int tripId)
        {
            using var db = DbContextFactory.Create();
            return await db.Expenses
                .Where(e => e.TripId == tripId)
                .OrderByDescending(e => e.Date)
                .ToListAsync();
        }

        public async Task<Expense> AddAsync(Expense expense)
        {
            using var db = DbContextFactory.Create();
            db.Expenses.Add(expense);
            await db.SaveChangesAsync();
            return expense;
        }

        public async Task<Expense?> UpdateAsync(int tripId, int expenseId, Action<Expense> applyChanges)
        {
            using var db = DbContextFactory.Create();
            var expense = await db.Expenses
                .FirstOrDefaultAsync(e => e.Id == expenseId && e.TripId == tripId);

            if (expense == null) return null;

            applyChanges(expense);
            await db.SaveChangesAsync();
            return expense;
        }

        public async Task<bool> DeleteAsync(int tripId, int expenseId)
        {
            using var db = DbContextFactory.Create();
            var expense = await db.Expenses
                .FirstOrDefaultAsync(e => e.Id == expenseId && e.TripId == tripId);

            if (expense == null) return false;

            db.Expenses.Remove(expense);
            await db.SaveChangesAsync();
            return true;
        }

        public async Task<decimal> GetTotalSpentAsync(int tripId)
        {
            using var db = DbContextFactory.Create();
            return await db.Expenses
                .Where(e => e.TripId == tripId)
                .SumAsync(e => e.Amount);
        }

        public async Task<decimal> GetPlannedBudgetAsync(int tripId)
        {
            using var db = DbContextFactory.Create();
            var trip = await db.Trips.FindAsync(tripId);
            return trip?.PlannedBudget ?? 0;
        }
    }
}