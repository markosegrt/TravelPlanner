using Common.Events;

namespace EventService.Handlers
{
    public static class AuditLogHandler
    {
        public static void Handle(DomainEvent domainEvent)
        {
            var logEntry = $"[AUDIT] {domainEvent.Timestamp:yyyy-MM-dd HH:mm:ss} | " +
                           $"Type: {domainEvent.EventType} | " +
                           $"Source: {domainEvent.ServiceSource} | " +
                           $"User: {domainEvent.UserId?.ToString() ?? "N/A"} | " +
                           $"Trip: {domainEvent.TripId?.ToString() ?? "N/A"} | " +
                           $"Message: {domainEvent.Message}";

            System.Diagnostics.Trace.WriteLine(logEntry);
        }
    }
}