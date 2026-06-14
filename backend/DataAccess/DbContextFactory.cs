using Microsoft.EntityFrameworkCore;

namespace DataAccess
{
    public static class DbContextFactory
    {
        public static AppDbContext Create()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlServer(DatabaseConfig.ConnectionString)
                .Options;

            return new AppDbContext(options);
        }
    }
}