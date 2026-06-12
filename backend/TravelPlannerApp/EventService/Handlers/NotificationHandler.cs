using Common.Events;

namespace EventService.Handlers
{
    public static class NotificationHandler
    {
        public static void Handle(DomainEvent domainEvent)
        {
            // Filtriramo samo evente koji zahtevaju notifikaciju
            if (!ShouldNotify(domainEvent)) return;

            var notification = $"[NOTIFICATION] {domainEvent.Timestamp:yyyy-MM-dd HH:mm:ss} | " +
                               $"Would send email for: {domainEvent.EventType} | " +
                               $"Message: {domainEvent.Message}";

            System.Diagnostics.Trace.WriteLine(notification);
        }

        private static bool ShouldNotify(DomainEvent domainEvent)
        {
            // Tipovi evenata koji bi trebalo da generišu notifikaciju
            return domainEvent.EventType is
                "PlanShared" or
                "BudgetExceeded" or
                "TripDeleted";
        }
    }
}