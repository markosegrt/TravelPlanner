using Microsoft.EntityFrameworkCore;

namespace DataAccess
{
    public static class DbContextFactory
    {
        // Centralizovano mesto za connection string za sve Remoting servise.
        // Gateway koristi svoj appsettings.json; ovo koriste samo domain servisi.
        private const string ConnectionString =
            "Server=localhost\\SQLEXPRESS;Database=TravelPlannerDB;" +
            "Trusted_Connection=True;TrustServerCertificate=True";

        public static AppDbContext Create()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlServer(ConnectionString)
                .Options;

            return new AppDbContext(options);
        }
    }
}