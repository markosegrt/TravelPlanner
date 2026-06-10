using Microsoft.EntityFrameworkCore;
using DataAccess;
using DataAccess.Entities;

namespace TripService.Repositories
{
    public class ActivityRepository
    {
        public async Task<List<Activity>> GetByTripAsync(int tripId)
        {
            using var db = DbContextFactory.Create();
            return await db.Activities
                .Where(a => a.TripId == tripId)
                .OrderBy(a => a.Date)
                .ThenBy(a => a.Time)
                .ToListAsync();
        }

        public async Task<Activity> AddAsync(Activity activity)
        {
            using var db = DbContextFactory.Create();
            db.Activities.Add(activity);
            await db.SaveChangesAsync();
            return activity;
        }

        public async Task<Activity?> UpdateAsync(int tripId, int activityId, Action<Activity> applyChanges)
        {
            using var db = DbContextFactory.Create();
            var activity = await db.Activities
                .FirstOrDefaultAsync(a => a.Id == activityId && a.TripId == tripId);

            if (activity == null) return null;

            applyChanges(activity);
            await db.SaveChangesAsync();
            return activity;
        }

        public async Task<bool> DeleteAsync(int tripId, int activityId)
        {
            using var db = DbContextFactory.Create();
            var activity = await db.Activities
                .FirstOrDefaultAsync(a => a.Id == activityId && a.TripId == tripId);

            if (activity == null) return false;

            db.Activities.Remove(activity);
            await db.SaveChangesAsync();
            return true;
        }
    }
}