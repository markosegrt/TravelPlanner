using Microsoft.EntityFrameworkCore;
using DataAccess;
using DataAccess.Entities;

namespace TripService.Repositories
{
    public class TripRepository
    {
        public async Task<List<Trip>> GetByUserAsync(int userId)
        {
            using var db = DbContextFactory.Create();
            return await db.Trips
                .Where(t => t.OwnerUserId == userId)
                .Include(t => t.Destinations)
                .Include(t => t.Expenses)
                .ToListAsync();
        }

        public async Task<Trip?> GetDetailAsync(int tripId, int userId)
        {
            using var db = DbContextFactory.Create();

            var query = db.Trips.Where(t => t.Id == tripId);

            if (userId > 0)
                query = query.Where(t => t.OwnerUserId == userId);

            return await query
                .Include(t => t.Destinations)
                .Include(t => t.Activities)
                .Include(t => t.Expenses)
                .Include(t => t.ChecklistItems)
                .FirstOrDefaultAsync();
        }

        public async Task<Trip> AddAsync(Trip trip)
        {
            using var db = DbContextFactory.Create();
            db.Trips.Add(trip);
            await db.SaveChangesAsync();
            return trip;
        }

        public async Task<Trip?> UpdateAsync(int tripId, int userId, Action<Trip> applyChanges)
        {
            using var db = DbContextFactory.Create();
            var trip = await db.Trips
                .Include(t => t.Destinations)
                .Include(t => t.Expenses)
                .FirstOrDefaultAsync(t => t.Id == tripId && t.OwnerUserId == userId);

            if (trip == null) return null;

            applyChanges(trip);
            await db.SaveChangesAsync();
            return trip;
        }

        public async Task<bool> DeleteAsync(int tripId, int userId)
        {
            using var db = DbContextFactory.Create();
            var trip = await db.Trips
                .FirstOrDefaultAsync(t => t.Id == tripId && t.OwnerUserId == userId);

            if (trip == null) return false;

            db.Trips.Remove(trip);
            await db.SaveChangesAsync();
            return true;
        }


        public async Task<Trip?> GetByIdAsync(int tripId)
        {
            using var db = DbContextFactory.Create();
            return await db.Trips.FindAsync(tripId);
        }
    }
}