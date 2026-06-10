using Common.Events;
using Microsoft.ServiceFabric.Services.Remoting;

namespace Common.Interfaces
{
    public interface IEventService : IService
    {
        Task PublishAsync(DomainEvent domainEvent);
    }
}