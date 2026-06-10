using Microsoft.AspNetCore.Identity;
using DataAccess.Entities;

namespace AuthService.Helpers
{
    public static class PasswordHelper
    {
        private static readonly PasswordHasher<User> Hasher = new();

        public static string Hash(User user, string password)
        {
            return Hasher.HashPassword(user, password);
        }

        public static bool Verify(User user, string hashedPassword, string providedPassword)
        {
            var result = Hasher.VerifyHashedPassword(user, hashedPassword, providedPassword);
            return result != PasswordVerificationResult.Failed;
        }
    }
}