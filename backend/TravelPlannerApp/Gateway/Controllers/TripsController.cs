using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Common.DTOs;
using Gateway.Helpers;

namespace Gateway.Controllers
{
    [ApiController]
    [Route("api/trips")]
    [Authorize]
    public class TripsController : ControllerBase
    {
        // GET /api/trips
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var userId = ClaimsHelper.GetUserId(User);
                var tripService = ServiceProxyHelper.GetTripService();
                var trips = await tripService.GetTripsByUserAsync(userId);
                return Ok(trips);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // GET /api/trips/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var userId = ClaimsHelper.GetUserId(User);
                var tripService = ServiceProxyHelper.GetTripService();
                var trip = await tripService.GetTripDetailAsync(id, userId);

                if (trip == null) return NotFound(new { error = "Trip not found." });
                return Ok(trip);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // POST /api/trips
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTripDto dto)
        {
            try
            {
                var userId = ClaimsHelper.GetUserId(User);
                var tripService = ServiceProxyHelper.GetTripService();
                var trip = await tripService.CreateTripAsync(dto, userId);
                return StatusCode(201, trip);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT /api/trips/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTripDto dto)
        {
            try
            {
                var userId = ClaimsHelper.GetUserId(User);
                var tripService = ServiceProxyHelper.GetTripService();
                var trip = await tripService.UpdateTripAsync(id, dto, userId);

                if (trip == null) return NotFound(new { error = "Trip not found." });
                return Ok(trip);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // DELETE /api/trips/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var userId = ClaimsHelper.GetUserId(User);
                var tripService = ServiceProxyHelper.GetTripService();
                var deleted = await tripService.DeleteTripAsync(id, userId);

                if (!deleted) return NotFound(new { error = "Trip not found." });
                return Ok(new { message = "Trip deleted." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}