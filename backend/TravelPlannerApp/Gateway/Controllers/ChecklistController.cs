using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Common.DTOs;
using Gateway.Helpers;

namespace Gateway.Controllers
{
    [ApiController]
    [Route("api/trips/{tripId}/checklist")]
    [Authorize]
    public class ChecklistController : ControllerBase
    {
        // GET /api/trips/{tripId}/checklist
        [HttpGet]
        public async Task<IActionResult> GetAll(int tripId)
        {
            try
            {
                var tripService = ServiceProxyHelper.GetTripService();
                var items = await tripService.GetChecklistAsync(tripId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // POST /api/trips/{tripId}/checklist
        [HttpPost]
        public async Task<IActionResult> Create(int tripId, [FromBody] CreateChecklistItemDto dto)
        {
            try
            {
                var tripService = ServiceProxyHelper.GetTripService();
                var item = await tripService.CreateChecklistItemAsync(tripId, dto);
                return StatusCode(201, item);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT /api/trips/{tripId}/checklist/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int tripId, int id, [FromBody] UpdateChecklistItemDto dto)
        {
            try
            {
                var tripService = ServiceProxyHelper.GetTripService();
                var item = await tripService.UpdateChecklistItemAsync(tripId, id, dto);

                if (item == null) return NotFound(new { error = "Checklist item not found." });
                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // DELETE /api/trips/{tripId}/checklist/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int tripId, int id)
        {
            try
            {
                var tripService = ServiceProxyHelper.GetTripService();
                var deleted = await tripService.DeleteChecklistItemAsync(tripId, id);

                if (!deleted) return NotFound(new { error = "Checklist item not found." });
                return Ok(new { message = "Checklist item deleted." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}