using System.Security.Claims;

namespace Gateway.Helpers
{
    public static class ClaimsHelper
    {
        public static int GetUserId(ClaimsPrincipal user)
        {
            var claim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(claim, out var userId))
                return userId;

            throw new UnauthorizedAccessException("Invalid token — user ID not found.");
        }

        public static string GetUserRole(ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.Role)?.Value ?? "User";
        }
    }
}