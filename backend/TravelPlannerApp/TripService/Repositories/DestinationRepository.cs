using Microsoft.EntityFrameworkCore;
using DataAccess;
using DataAccess.Entities;

namespace TripService.Repositories
{
    public class DestinationRepository
    {
        public async Task<List<Destination>> GetByTripAsync(int tripId)
        {
            using var db = DbContextFactory.Create();
            return await db.Destinations
                .Where(d => d.TripId == tripId)
                .ToListAsync();
        }

        public async Task<Destination> AddAsync(Destination destination)
        {
            using var db = DbContextFactory.Create();
            db.Destinations.Add(destination);
            await db.SaveChangesAsync();
            return destination;
        }

        public async Task<Destination?> UpdateAsync(int tripId, int destinationId, Action<Destination> applyChanges)
        {
            using var db = DbContextFactory.Create();
            var destination = await db.Destinations
                .FirstOrDefaultAsync(d => d.Id == destinationId && d.TripId == tripId);

            if (destination == null) return null;

            applyChanges(destination);
            await db.SaveChangesAsync();
            return destination;
        }

        public async Task<bool> DeleteAsync(int tripId, int destinationId)
        {
            using var db = DbContextFactory.Create();
            var destination = await db.Destinations
                .FirstOrDefaultAsync(d => d.Id == destinationId && d.TripId == tripId);

            if (destination == null) return false;

            db.Destinations.Remove(destination);
            await db.SaveChangesAsync();
            return true;
        }
    }
}