using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Common.DTOs;
using Gateway.Helpers;

namespace Gateway.Controllers
{
    [ApiController]
    [Route("api/trips/{tripId}/destinations")]
    [Authorize]
    public class DestinationsController : ControllerBase
    {
        // GET /api/trips/{tripId}/destinations
        [HttpGet]
        public async Task<IActionResult> GetAll(int tripId)
        {
            try
            {
                var tripService = ServiceProxyHelper.GetTripService();
                var destinations = await tripService.GetDestinationsAsync(tripId);
                return Ok(destinations);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // POST /api/trips/{tripId}/destinations
        [HttpPost]
        public async Task<IActionResult> Create(int tripId, [FromBody] CreateDestinationDto dto)
        {
            try
            {
                var tripService = ServiceProxyHelper.GetTripService();
                var destination = await tripService.CreateDestinationAsync(tripId, dto);
                return StatusCode(201, destination);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT /api/trips/{tripId}/destinations/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int tripId, int id, [FromBody] UpdateDestinationDto dto)
        {
            try
            {
                var tripService = ServiceProxyHelper.GetTripService();
                var destination = await tripService.UpdateDestinationAsync(tripId, id, dto);

                if (destination == null) return NotFound(new { error = "Destination not found." });
                return Ok(destination);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // DELETE /api/trips/{tripId}/destinations/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int tripId, int id)
        {
            try
            {
                var tripService = ServiceProxyHelper.GetTripService();
                var deleted = await tripService.DeleteDestinationAsync(tripId, id);

                if (!deleted) return NotFound(new { error = "Destination not found." });
                return Ok(new { message = "Destination deleted." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}