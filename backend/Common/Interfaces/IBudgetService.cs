using Common.DTOs;
using Microsoft.ServiceFabric.Services.Remoting;

namespace Common.Interfaces
{
    public interface IBudgetService : IService
    {
        Task<List<ExpenseDto>> GetExpensesAsync(int tripId);
        Task<ExpenseDto> CreateExpenseAsync(int tripId, CreateExpenseDto dto);
        Task<ExpenseDto?> UpdateExpenseAsync(int tripId, int expenseId, UpdateExpenseDto dto);
        Task<bool> DeleteExpenseAsync(int tripId, int expenseId);
        Task<BudgetSummaryDto> GetBudgetSummaryAsync(int tripId);
    }
}