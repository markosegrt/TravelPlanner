using Microsoft.ServiceFabric.Services.Remoting.Client;
using Microsoft.ServiceFabric.Services.Client;
using Common.Interfaces;

namespace Common.Events
{
    public static class EventPublisher
    {
        private static readonly Uri EventServiceUri =
            new("fabric:/TravelPlannerApp/EventService");

        public static async Task TryPublishAsync(
            string eventType,
            string message,
            string serviceSource,
            int? userId = null,
            int? tripId = null)
        {
            try
            {
                var proxy = ServiceProxy.Create<IEventService>(
                    EventServiceUri,
                    new ServicePartitionKey(0));

                await proxy.PublishAsync(new DomainEvent
                {
                    EventType = eventType,
                    Message = message,
                    ServiceSource = serviceSource,
                    UserId = userId,
                    TripId = tripId,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch
            {
                System.Diagnostics.Trace.WriteLine(
                    $"[EventPublisher] Failed to publish {eventType}. EventService may be unavailable.");
            }
        }
    }
}