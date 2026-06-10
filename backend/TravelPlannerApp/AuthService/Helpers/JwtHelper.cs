using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Common.Config;
using DataAccess.Entities;

namespace AuthService.Helpers
{
    // [OUT-OF-EXERCISE] JWT generisanje i validacija — nije pokriveno na vežbama
    public static class JwtHelper
    {
        public static string GenerateToken(User user)
        {
            var key = Encoding.UTF8.GetBytes(JwtSettings.SecretKey);
            var credentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: JwtSettings.Issuer,
                audience: JwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(JwtSettings.ExpirationMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public static bool ValidateToken(string token)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                handler.ValidateToken(token, GetValidationParameters(), out _);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static int? GetUserIdFromToken(string token)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var principal = handler.ValidateToken(token, GetValidationParameters(), out _);

                var claim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(claim, out var userId))
                    return userId;

                return null;
            }
            catch
            {
                return null;
            }
        }

        private static TokenValidationParameters GetValidationParameters()
        {
            return new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(JwtSettings.SecretKey)),
                ValidateIssuer = true,
                ValidIssuer = JwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = JwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        }
    }
}