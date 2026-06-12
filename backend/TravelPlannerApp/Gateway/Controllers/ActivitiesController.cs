using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Common.DTOs;
using Gateway.Helpers;

namespace Gateway.Controllers
{
    [ApiController]
    [Route("api/trips/{tripId}/activities")]
    [Authorize]
    public class ActivitiesController : ControllerBase
    {
        // GET /api/trips/{tripId}/activities
        [HttpGet]
        public async Task<IActionResult> GetAll(int tripId)
        {
            try
            {
                var tripService = ServiceProxyHelper.GetTripService();
                var activities = await tripService.GetActivitiesAsync(tripId);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // POST /api/trips/{tripId}/activities
        [HttpPost]
        public async Task<IActionResult> Create(int tripId, [FromBody] CreateActivityDto dto)
        {
            try
            {
                var tripService = ServiceProxyHelper.GetTripService();
                var activity = await tripService.CreateActivityAsync(tripId, dto);
                return StatusCode(201, activity);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT /api/trips/{tripId}/activities/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int tripId, int id, [FromBody] UpdateActivityDto dto)
        {
            try
            {
                var tripService = ServiceProxyHelper.GetTripService();
                var activity = await tripService.UpdateActivityAsync(tripId, id, dto);

                if (activity == null) return NotFound(new { error = "Activity not found." });
                return Ok(activity);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // DELETE /api/trips/{tripId}/activities/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int tripId, int id)
        {
            try
            {
                var tripService = ServiceProxyHelper.GetTripService();
                var deleted = await tripService.DeleteActivityAsync(tripId, id);

                if (!deleted) return NotFound(new { error = "Activity not found." });
                return Ok(new { message = "Activity deleted." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}