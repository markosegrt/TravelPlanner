using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Common.DTOs;
using Common.Enums;
using Gateway.Helpers;

namespace Gateway.Controllers
{
    [ApiController]
    public class ShareController : ControllerBase
    {
        // POST /api/trips/{tripId}/share
        // Kreira share token + QR kod
        [HttpPost("api/trips/{tripId}/share")]
        [Authorize]
        public async Task<IActionResult> CreateShare(int tripId, [FromBody] CreateShareDto dto)
        {
            try
            {
                var userId = ClaimsHelper.GetUserId(User);

                // Proveri da li korisnik poseduje trip
                var tripService = ServiceProxyHelper.GetTripService();
                var trip = await tripService.GetTripDetailAsync(tripId, userId);
                if (trip == null)
                    return NotFound(new { error = "Trip not found." });

                // Kreiraj share token
                var authService = ServiceProxyHelper.GetAuthService();
                var shareToken = await authService.CreateShareTokenAsync(tripId, dto.AccessLevel);

                // Generiši QR kod sa share URL-om
                var shareUrl = $"{Request.Scheme}://{Request.Host}/api/shared/{shareToken.Token}";
                var docService = ServiceProxyHelper.GetDocumentService();
                var qrBase64 = await docService.GenerateQrCodeBase64Async(shareUrl);

                return Ok(new ShareResponseDto
                {
                    Token = shareToken.Token,
                    AccessLevel = shareToken.AccessLevel,
                    ShareUrl = shareUrl,
                    QrCodeBase64 = qrBase64
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // GET /api/shared/{token}
        // Pristup deljenom planu — VIEW ili EDIT prema tipu tokena
        [HttpGet("api/shared/{token}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSharedPlan(string token)
        {
            try
            {
                // Validiraj share token
                var authService = ServiceProxyHelper.GetAuthService();
                var shareToken = await authService.ValidateShareTokenAsync(token);

                if (shareToken == null)
                    return NotFound(new { error = "Invalid or expired share link." });

                // Dohvati trip podatke — koristimo tripId iz tokena
                // Za shared pristup ne proveravamo userId ownership
                var tripService = ServiceProxyHelper.GetTripService();
                var trip = await tripService.GetTripDetailAsync(shareToken.TripId, 0);

                if (trip == null)
                    return NotFound(new { error = "Trip not found." });

                return Ok(new SharedPlanDto
                {
                    AccessLevel = shareToken.AccessLevel,
                    Trip = trip
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT /api/shared/{token}/activities/{id}
        // Primer EDIT operacije kroz share token
        [HttpPut("api/shared/{token}/activities/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> UpdateSharedActivity(
            string token, int id, [FromBody] UpdateActivityDto dto)
        {
            try
            {
                // [FACT: spec §3.8] Backend validira token tip pri svakom zahtevu
                var authService = ServiceProxyHelper.GetAuthService();
                var shareToken = await authService.ValidateShareTokenAsync(token);

                if (shareToken == null)
                    return NotFound(new { error = "Invalid or expired share link." });

                if (shareToken.AccessLevel != AccessLevel.Edit)
                    return Forbid();

                var tripService = ServiceProxyHelper.GetTripService();
                var activity = await tripService.UpdateActivityAsync(
                    shareToken.TripId, id, dto);

                if (activity == null)
                    return NotFound(new { error = "Activity not found." });

                return Ok(activity);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}