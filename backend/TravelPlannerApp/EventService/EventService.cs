using System;
using System.Collections.Generic;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Common.Events;
using Common.Interfaces;
using EventService.Handlers;

namespace EventService
{
    
    internal sealed class EventService : StatefulService, IEventService
    {
        private const string QueueName = "domainEventQueue";

        public EventService(StatefulServiceContext context)
            : base(context)
        { }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return this.CreateServiceRemotingReplicaListeners();
        }
        public async Task PublishAsync(DomainEvent domainEvent)
        {
            var queue = await this.StateManager
                .GetOrAddAsync<IReliableQueue<DomainEvent>>(QueueName);

            using var tx = this.StateManager.CreateTransaction();
            await queue.EnqueueAsync(tx, domainEvent);
            await tx.CommitAsync();
        }

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            var queue = await this.StateManager
                .GetOrAddAsync<IReliableQueue<DomainEvent>>(QueueName);

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                using var tx = this.StateManager.CreateTransaction();

                var result = await queue.TryDequeueAsync(tx);

                if (result.HasValue)
                {
                    var domainEvent = result.Value;

                    try
                    {
                        AuditLogHandler.Handle(domainEvent);
                        NotificationHandler.Handle(domainEvent);
                        await tx.CommitAsync();
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Trace.WriteLine(
                            $"[EventService] Error processing event: {ex.Message}. " +
                            $"Event will be retried.");
                    }
                }
                else
                {
                    await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
                }
            }
        }
    }
}