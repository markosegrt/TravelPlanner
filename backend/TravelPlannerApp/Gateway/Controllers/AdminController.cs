using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Gateway.Helpers;
using Common.DTOs;

namespace Gateway.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        // GET /api/admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var authService = ServiceProxyHelper.GetAuthService();
                var users = await authService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT /api/admin/users/{id}
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] UpdateUserStatusDto dto)
        {
            try
            {
                var authService = ServiceProxyHelper.GetAuthService();
                var updated = await authService.UpdateUserStatusAsync(id, dto.IsActive);

                if (!updated) return NotFound(new { error = "User not found." });
                return Ok(new { message = "User status updated." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // GET /api/admin/trips
        [HttpGet("trips")]
        public async Task<IActionResult> GetAllTrips()
        {
            try
            {
                var tripService = ServiceProxyHelper.GetTripService();
                var trips = await tripService.GetAllTripsForAdminAsync();
                return Ok(trips);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT /api/admin/users/{id}/role
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleDto dto)
        {
            try
            {
                var authService = ServiceProxyHelper.GetAuthService();
                var updated = await authService.UpdateUserRoleAsync(id, dto.Role);

                if (!updated) return NotFound(new { error = "User not found." });
                return Ok(new { message = "User role updated." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT /api/admin/users/{id}/password
        [HttpPut("users/{id}/password")]
        public async Task<IActionResult> ResetUserPassword(int id, [FromBody] ResetPasswordDto dto)
        {
            try
            {
                var authService = ServiceProxyHelper.GetAuthService();
                var updated = await authService.ResetUserPasswordAsync(id, dto.NewPassword);

                if (!updated) return NotFound(new { error = "User not found." });
                return Ok(new { message = "Password reset successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}