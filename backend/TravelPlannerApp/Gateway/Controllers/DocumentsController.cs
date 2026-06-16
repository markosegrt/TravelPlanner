using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Common.Enums;
using Gateway.Helpers;

namespace Gateway.Controllers
{
    [ApiController]
    [Route("api/trips/{tripId}")]
    [Authorize]
    public class DocumentsController : ControllerBase
    {
        // GET /api/trips/{tripId}/report.pdf
        // [OUT-OF-EXERCISE] PDF export
        [HttpGet("report.pdf")]
        public async Task<IActionResult> GetPdfReport(int tripId)
        {
            try
            {
                var userId = ClaimsHelper.GetUserId(User);

                // 1. Dohvati kompletne podatke o putovanju
                var tripService = ServiceProxyHelper.GetTripService();
                var tripDetail = await tripService.GetTripDetailAsync(tripId, userId);
                if (tripDetail == null)
                    return NotFound(new { error = "Trip not found." });

                // 2. Napravi VIEW share token za QR u PDF-u i sklopi frontend link
                var authService = ServiceProxyHelper.GetAuthService();
                var shareToken = await authService.CreateShareTokenAsync(tripId, AccessLevel.View);
                var shareUrl = $"http://localhost:5173/shared/{shareToken.Token}";

                // 3. Prosledi composed DTO + share link DocumentService-u (P3 odluka)
                var docService = ServiceProxyHelper.GetDocumentService();
                var pdfBytes = await docService.GeneratePdfReportAsync(tripDetail, shareUrl);

                // 4. Vrati PDF kao fajl
                return File(pdfBytes, "application/pdf", $"{tripDetail.Name}-plan.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}