using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Common.DTOs;
using Common.Interfaces;
using Common.Events;
using DataAccess.Entities;
using DataAccess.Mappers;
using BudgetService.Repositories;

namespace BudgetService
{
    internal sealed class BudgetService : StatelessService, IBudgetService
    {
        private readonly ExpenseRepository _expenseRepo = new();

        public BudgetService(StatelessServiceContext context)
            : base(context)
        { }

        // Remoting listener
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return this.CreateServiceRemotingInstanceListeners();
        }

        // ====== GET EXPENSES ======
        public async Task<List<ExpenseDto>> GetExpensesAsync(int tripId)
        {
            var expenses = await _expenseRepo.GetByTripAsync(tripId);
            return expenses.Select(EntityMappers.ToExpenseDto).ToList();
        }

        // ====== CREATE EXPENSE ======
        public async Task<ExpenseDto> CreateExpenseAsync(int tripId, CreateExpenseDto dto)
        {
            if (dto.Amount < 0)
                throw new InvalidOperationException("Amount cannot be negative.");

            var expense = new Expense
            {
                Name = dto.Name,
                Category = dto.Category,
                Amount = dto.Amount,
                Date = dto.Date,
                Description = dto.Description,
                TripId = tripId
            };

            await _expenseRepo.AddAsync(expense);

            await EventPublisher.TryPublishAsync(
                "ExpenseAdded",
                $"Expense added: {expense.Name} ({expense.Amount:C})",
                "BudgetService",
                tripId: tripId);

            var planned = await _expenseRepo.GetPlannedBudgetAsync(tripId);
            var spent = await _expenseRepo.GetTotalSpentAsync(tripId);
            if (spent > planned)
            {
                await EventPublisher.TryPublishAsync(
                    "BudgetExceeded",
                    $"Budget exceeded for trip {tripId}: spent {spent:C} of {planned:C}",
                    "BudgetService",
                    tripId: tripId);
            }

            return EntityMappers.ToExpenseDto(expense);
        }

        // ====== UPDATE EXPENSE ======
        public async Task<ExpenseDto?> UpdateExpenseAsync(int tripId, int expenseId, UpdateExpenseDto dto)
        {
            if (dto.Amount < 0)
                throw new InvalidOperationException("Amount cannot be negative.");

            var expense = await _expenseRepo.UpdateAsync(tripId, expenseId, e =>
            {
                e.Name = dto.Name;
                e.Category = dto.Category;
                e.Amount = dto.Amount;
                e.Date = dto.Date;
                e.Description = dto.Description;
            });

            return expense == null ? null : EntityMappers.ToExpenseDto(expense);
        }

        // ====== DELETE EXPENSE ======
        public async Task<bool> DeleteExpenseAsync(int tripId, int expenseId)
        {
            return await _expenseRepo.DeleteAsync(tripId, expenseId);
        }

        // ====== BUDGET SUMMARY ======
        public async Task<BudgetSummaryDto> GetBudgetSummaryAsync(int tripId)
        {
            var planned = await _expenseRepo.GetPlannedBudgetAsync(tripId);
            var spent = await _expenseRepo.GetTotalSpentAsync(tripId);

            return EntityMappers.ToBudgetSummaryDto(planned, spent);
        }
    }
}