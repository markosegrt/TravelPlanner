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

                var tripService = ServiceProxyHelper.GetTripService();
                var trip = await tripService.GetTripDetailAsync(tripId, userId);
                if (trip == null)
                    return NotFound(new { error = "Trip not found." });

                var authService = ServiceProxyHelper.GetAuthService();
                var shareToken = await authService.CreateShareTokenAsync(tripId, dto.AccessLevel);

                // QR kodira FRONTEND link (gde živi shared stranica), ne backend API URL.
                var frontendBaseUrl = "http://localhost:5173";
                var shareUrl = $"{frontendBaseUrl}/shared/{shareToken.Token}";

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
                var authService = ServiceProxyHelper.GetAuthService();
                var shareToken = await authService.ValidateShareTokenAsync(token);

                if (shareToken == null)
                    return NotFound(new { error = "Invalid or expired share link." });

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

        private async Task<(int tripId, IActionResult? error)> ResolveEditTokenAsync(string token)
        {
            var authService = ServiceProxyHelper.GetAuthService();
            var shareToken = await authService.ValidateShareTokenAsync(token);

            if (shareToken == null)
                return (0, NotFound(new { error = "Invalid or expired share link." }));

            if (shareToken.AccessLevel != AccessLevel.Edit)
                return (0, StatusCode(403, new { error = "This link is view-only." }));

            return (shareToken.TripId, null);
        }

        // ---------- DESTINATIONS ----------

        [HttpPost("api/shared/{token}/destinations")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateSharedDestination(string token, [FromBody] CreateDestinationDto dto)
        {
            try
            {
                var (tripId, error) = await ResolveEditTokenAsync(token);
                if (error != null) return error;

                var tripService = ServiceProxyHelper.GetTripService();
                var result = await tripService.CreateDestinationAsync(tripId, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("api/shared/{token}/destinations/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> UpdateSharedDestination(string token, int id, [FromBody] UpdateDestinationDto dto)
        {
            try
            {
                var (tripId, error) = await ResolveEditTokenAsync(token);
                if (error != null) return error;

                var tripService = ServiceProxyHelper.GetTripService();
                var result = await tripService.UpdateDestinationAsync(tripId, id, dto);
                if (result == null) return NotFound(new { error = "Destination not found." });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("api/shared/{token}/destinations/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> DeleteSharedDestination(string token, int id)
        {
            try
            {
                var (tripId, error) = await ResolveEditTokenAsync(token);
                if (error != null) return error;

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

        // ---------- ACTIVITIES ----------

        [HttpPost("api/shared/{token}/activities")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateSharedActivity(string token, [FromBody] CreateActivityDto dto)
        {
            try
            {
                var (tripId, error) = await ResolveEditTokenAsync(token);
                if (error != null) return error;

                var tripService = ServiceProxyHelper.GetTripService();
                var result = await tripService.CreateActivityAsync(tripId, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT /api/shared/{token}/activities/{id}  (postojeći — zadržan)
        [HttpPut("api/shared/{token}/activities/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> UpdateSharedActivity(
            string token, int id, [FromBody] UpdateActivityDto dto)
        {
            try
            {
                var (tripId, error) = await ResolveEditTokenAsync(token);
                if (error != null) return error;

                var tripService = ServiceProxyHelper.GetTripService();
                var activity = await tripService.UpdateActivityAsync(tripId, id, dto);
                if (activity == null)
                    return NotFound(new { error = "Activity not found." });
                return Ok(activity);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("api/shared/{token}/activities/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> DeleteSharedActivity(string token, int id)
        {
            try
            {
                var (tripId, error) = await ResolveEditTokenAsync(token);
                if (error != null) return error;

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

        // ---------- CHECKLIST ----------

        [HttpPost("api/shared/{token}/checklist")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateSharedChecklistItem(string token, [FromBody] CreateChecklistItemDto dto)
        {
            try
            {
                var (tripId, error) = await ResolveEditTokenAsync(token);
                if (error != null) return error;

                var tripService = ServiceProxyHelper.GetTripService();
                var result = await tripService.CreateChecklistItemAsync(tripId, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("api/shared/{token}/checklist/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> UpdateSharedChecklistItem(string token, int id, [FromBody] UpdateChecklistItemDto dto)
        {
            try
            {
                var (tripId, error) = await ResolveEditTokenAsync(token);
                if (error != null) return error;

                var tripService = ServiceProxyHelper.GetTripService();
                var result = await tripService.UpdateChecklistItemAsync(tripId, id, dto);
                if (result == null) return NotFound(new { error = "Checklist item not found." });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("api/shared/{token}/checklist/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> DeleteSharedChecklistItem(string token, int id)
        {
            try
            {
                var (tripId, error) = await ResolveEditTokenAsync(token);
                if (error != null) return error;

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

        // ---------- NOTES ----------
        // Notes su polje Trip-a. Da ne diramo budžet/datume kroz share,
        // dohvatimo trip, pošaljemo nazad ista polja a promenimo samo GeneralNotes.

        [HttpPut("api/shared/{token}/notes")]
        [AllowAnonymous]
        public async Task<IActionResult> UpdateSharedNotes(string token, [FromBody] UpdateNotesDto dto)
        {
            try
            {
                var (tripId, error) = await ResolveEditTokenAsync(token);
                if (error != null) return error;

                var tripService = ServiceProxyHelper.GetTripService();

                // Dohvati trenutni trip (userId=0 jer je share kontekst)
                var trip = await tripService.GetTripDetailAsync(tripId, 0);
                if (trip == null) return NotFound(new { error = "Trip not found." });

                // Pošalji nazad ista polja, promeni samo notes — budžet/datumi netaknuti
                var updated = await tripService.UpdateTripAsync(tripId, new UpdateTripDto
                {
                    Name = trip.Name,
                    Description = trip.Description,
                    StartDate = trip.StartDate,
                    EndDate = trip.EndDate,
                    PlannedBudget = trip.PlannedBudget,
                    GeneralNotes = dto.GeneralNotes
                }, trip.OwnerUserId);

                if (updated == null) return NotFound(new { error = "Trip not found." });
                return Ok(new { message = "Notes updated." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}