using Microsoft.EntityFrameworkCore;
using Common.Enums;
using DataAccess;
using DataAccess.Entities;

namespace AuthService.Repositories
{
    public class ShareTokenRepository
    {
        public async Task<ShareToken> CreateAsync(int tripId, AccessLevel accessLevel)
        {
            using var db = DbContextFactory.Create();

            var shareToken = new ShareToken
            {
                Token = Guid.NewGuid().ToString(),
                TripId = tripId,
                AccessLevel = accessLevel,
                CreatedAt = DateTime.UtcNow
            };

            db.ShareTokens.Add(shareToken);
            await db.SaveChangesAsync();
            return shareToken;
        }

        public async Task<ShareToken?> FindByTokenAsync(string token)
        {
            using var db = DbContextFactory.Create();
            return await db.ShareTokens
                .FirstOrDefaultAsync(s => s.Token == token);
        }
    }
}