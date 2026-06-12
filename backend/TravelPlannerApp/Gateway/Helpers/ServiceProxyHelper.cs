using Microsoft.ServiceFabric.Services.Remoting.Client;
using Common.Interfaces;

namespace Gateway.Helpers
{
    public static class ServiceProxyHelper
    {
        private const string AppName = "fabric:/TravelPlannerApp";

        public static IAuthService GetAuthService()
        {
            return ServiceProxy.Create<IAuthService>(
                new Uri($"{AppName}/AuthService"));
        }

        public static ITripService GetTripService()
        {
            return ServiceProxy.Create<ITripService>(
                new Uri($"{AppName}/TripService"));
        }

        public static IBudgetService GetBudgetService()
        {
            return ServiceProxy.Create<IBudgetService>(
                new Uri($"{AppName}/BudgetService"));
        }

        public static IDocumentService GetDocumentService()
        {
            return ServiceProxy.Create<IDocumentService>(
                new Uri($"{AppName}/DocumentService"));
        }

        public static IEventService GetEventService()
        {
            return ServiceProxy.Create<IEventService>(
                new Uri($"{AppName}/EventService"),
                new Microsoft.ServiceFabric.Services.Client.ServicePartitionKey(0));
        }
    }
}