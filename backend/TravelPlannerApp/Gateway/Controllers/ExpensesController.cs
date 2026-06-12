using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Common.DTOs;
using Gateway.Helpers;

namespace Gateway.Controllers
{
    [ApiController]
    [Route("api/trips/{tripId}/expenses")]
    [Authorize]
    public class ExpensesController : ControllerBase
    {
        // GET /api/trips/{tripId}/expenses
        [HttpGet]
        public async Task<IActionResult> GetAll(int tripId)
        {
            try
            {
                var budgetService = ServiceProxyHelper.GetBudgetService();
                var expenses = await budgetService.GetExpensesAsync(tripId);
                return Ok(expenses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // POST /api/trips/{tripId}/expenses
        [HttpPost]
        public async Task<IActionResult> Create(int tripId, [FromBody] CreateExpenseDto dto)
        {
            try
            {
                var budgetService = ServiceProxyHelper.GetBudgetService();
                var expense = await budgetService.CreateExpenseAsync(tripId, dto);
                return StatusCode(201, expense);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT /api/trips/{tripId}/expenses/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int tripId, int id, [FromBody] UpdateExpenseDto dto)
        {
            try
            {
                var budgetService = ServiceProxyHelper.GetBudgetService();
                var expense = await budgetService.UpdateExpenseAsync(tripId, id, dto);

                if (expense == null) return NotFound(new { error = "Expense not found." });
                return Ok(expense);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // DELETE /api/trips/{tripId}/expenses/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int tripId, int id)
        {
            try
            {
                var budgetService = ServiceProxyHelper.GetBudgetService();
                var deleted = await budgetService.DeleteExpenseAsync(tripId, id);

                if (!deleted) return NotFound(new { error = "Expense not found." });
                return Ok(new { message = "Expense deleted." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // GET /api/trips/{tripId}/budget-summary
        [HttpGet("/api/trips/{tripId}/budget-summary")]
        public async Task<IActionResult> GetBudgetSummary(int tripId)
        {
            try
            {
                var budgetService = ServiceProxyHelper.GetBudgetService();
                var summary = await budgetService.GetBudgetSummaryAsync(tripId);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}