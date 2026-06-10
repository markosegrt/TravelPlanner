using Microsoft.EntityFrameworkCore;
using DataAccess;
using DataAccess.Entities;

namespace TripService.Repositories
{
    public class ChecklistRepository
    {
        public async Task<List<ChecklistItem>> GetByTripAsync(int tripId)
        {
            using var db = DbContextFactory.Create();
            return await db.ChecklistItems
                .Where(c => c.TripId == tripId)
                .ToListAsync();
        }

        public async Task<ChecklistItem> AddAsync(ChecklistItem item)
        {
            using var db = DbContextFactory.Create();
            db.ChecklistItems.Add(item);
            await db.SaveChangesAsync();
            return item;
        }

        public async Task<ChecklistItem?> UpdateAsync(int tripId, int itemId, Action<ChecklistItem> applyChanges)
        {
            using var db = DbContextFactory.Create();
            var item = await db.ChecklistItems
                .FirstOrDefaultAsync(c => c.Id == itemId && c.TripId == tripId);

            if (item == null) return null;

            applyChanges(item);
            await db.SaveChangesAsync();
            return item;
        }

        public async Task<bool> DeleteAsync(int tripId, int itemId)
        {
            using var db = DbContextFactory.Create();
            var item = await db.ChecklistItems
                .FirstOrDefaultAsync(c => c.Id == itemId && c.TripId == tripId);

            if (item == null) return false;

            db.ChecklistItems.Remove(item);
            await db.SaveChangesAsync();
            return true;
        }
    }
}