using Common.Enums;
using DataAccess;
using DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Repositories
{
    public class UserRepository
    {
        public async Task<bool> ExistsByEmailAsync(string email)
        {
            using var db = DbContextFactory.Create();
            return await db.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<User?> FindByEmailAsync(string email)
        {
            using var db = DbContextFactory.Create();
            return await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> FindByIdAsync(int userId)
        {
            using var db = DbContextFactory.Create();
            return await db.Users.FindAsync(userId);
        }

        public async Task<List<User>> GetAllAsync()
        {
            using var db = DbContextFactory.Create();
            return await db.Users.ToListAsync();
        }

        public async Task AddAsync(User user)
        {
            using var db = DbContextFactory.Create();
            db.Users.Add(user);
            await db.SaveChangesAsync();
        }

        public async Task<bool> UpdateStatusAsync(int userId, bool isActive)
        {
            using var db = DbContextFactory.Create();
            var user = await db.Users.FindAsync(userId);
            if (user == null) return false;

            user.IsActive = isActive;
            db.Users.Update(user);
            await db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateRoleAsync(int userId, UserRole role)
        {
            using var db = DbContextFactory.Create();
            var user = await db.Users.FindAsync(userId);
            if (user == null) return false;

            user.Role = role;
            db.Users.Update(user);
            await db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdatePasswordHashAsync(int userId, string passwordHash)
        {
            using var db = DbContextFactory.Create();
            var user = await db.Users.FindAsync(userId);
            if (user == null) return false;

            user.PasswordHash = passwordHash;
            db.Users.Update(user);
            await db.SaveChangesAsync();
            return true;
        }
    }
}