using System.Runtime.Serialization;

namespace Common.Events
{
    [DataContract]
    public class DomainEvent
    {
        [DataMember]
        public string EventType { get; set; } = string.Empty;

        [DataMember]
        public string Message { get; set; } = string.Empty;

        [DataMember]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [DataMember]
        public string ServiceSource { get; set; } = string.Empty;

        [DataMember]
        public int? UserId { get; set; }

        [DataMember]
        public int? TripId { get; set; }
    }
}