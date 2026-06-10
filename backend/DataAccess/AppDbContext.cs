using DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace DataAccess
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Trip> Trips { get; set; }
        public DbSet<Destination> Destinations { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<ChecklistItem> ChecklistItems { get; set; }
        public DbSet<ShareToken> ShareTokens { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ---- User ----
            modelBuilder.Entity<User>(e =>
            {
                e.HasKey(u => u.Id);
                e.HasIndex(u => u.Email).IsUnique();
                e.Property(u => u.Name).IsRequired().HasMaxLength(100);
                e.Property(u => u.Email).IsRequired().HasMaxLength(200);
                e.Property(u => u.PasswordHash).IsRequired();
            });

            // ---- Trip ----
            modelBuilder.Entity<Trip>(e =>
            {
                e.HasKey(t => t.Id);
                e.Property(t => t.Name).IsRequired().HasMaxLength(200);
                e.Property(t => t.PlannedBudget).HasColumnType("decimal(18,2)");

                e.HasOne(t => t.Owner)
                 .WithMany(u => u.Trips)
                 .HasForeignKey(t => t.OwnerUserId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ---- Destination ----
            modelBuilder.Entity<Destination>(e =>
            {
                e.HasKey(d => d.Id);
                e.Property(d => d.Name).IsRequired().HasMaxLength(200);
                e.Property(d => d.Location).IsRequired().HasMaxLength(300);

                e.HasOne(d => d.Trip)
                 .WithMany(t => t.Destinations)
                 .HasForeignKey(d => d.TripId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ---- Activity ----
            modelBuilder.Entity<Activity>(e =>
            {
                e.HasKey(a => a.Id);
                e.Property(a => a.Name).IsRequired().HasMaxLength(200);
                e.Property(a => a.EstimatedCost).HasColumnType("decimal(18,2)");

                e.HasOne(a => a.Trip)
                 .WithMany(t => t.Activities)
                 .HasForeignKey(a => a.TripId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(a => a.Destination)
                 .WithMany(d => d.Activities)
                 .HasForeignKey(a => a.DestinationId)
                 .OnDelete(DeleteBehavior.NoAction);
            });

            // ---- Expense ----
            modelBuilder.Entity<Expense>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.Name).IsRequired().HasMaxLength(200);
                e.Property(x => x.Amount).HasColumnType("decimal(18,2)");

                e.HasOne(x => x.Trip)
                 .WithMany(t => t.Expenses)
                 .HasForeignKey(x => x.TripId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ---- ChecklistItem ----
            modelBuilder.Entity<ChecklistItem>(e =>
            {
                e.HasKey(c => c.Id);
                e.Property(c => c.Name).IsRequired().HasMaxLength(300);

                e.HasOne(c => c.Trip)
                 .WithMany(t => t.ChecklistItems)
                 .HasForeignKey(c => c.TripId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ---- ShareToken ----
            modelBuilder.Entity<ShareToken>(e =>
            {
                e.HasKey(s => s.Id);
                e.HasIndex(s => s.Token).IsUnique();
                e.Property(s => s.Token).IsRequired().HasMaxLength(100);

                e.HasOne(s => s.Trip)
                 .WithMany(t => t.ShareTokens)
                 .HasForeignKey(s => s.TripId)
                 .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}