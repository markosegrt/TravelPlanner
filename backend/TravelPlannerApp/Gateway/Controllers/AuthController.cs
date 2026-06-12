using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Common.DTOs;
using Gateway.Helpers;

namespace Gateway.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        // ====== REGISTER (public) ======
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                var authService = ServiceProxyHelper.GetAuthService();
                var result = await authService.RegisterAsync(dto);
                return StatusCode(201, result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ====== LOGIN (public) ======
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var authService = ServiceProxyHelper.GetAuthService();
                var result = await authService.LoginAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ====== GET CURRENT USER (protected) ======
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userId = ClaimsHelper.GetUserId(User);
                var authService = ServiceProxyHelper.GetAuthService();
                var user = await authService.GetUserByIdAsync(userId);

                if (user == null) return NotFound(new { error = "User not found." });
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}