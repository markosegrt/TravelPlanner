namespace DataAccess
{
    /// <summary>
    /// Jedini izvor istine za connection string.
    /// Koriste ga DbContextFactory (runtime servisi) i
    /// DesignTimeDbContextFactory (EF migracije).
    /// Windows Authentication (Trusted_Connection) — nema lozinke u kodu.
    /// </summary>
    public static class DatabaseConfig
    {
        public const string ConnectionString =
            "Server=localhost\\SQLEXPRESS;" +
            "Database=TravelPlannerDB;" +
            "Trusted_Connection=True;" +
            "TrustServerCertificate=True";
    }
}