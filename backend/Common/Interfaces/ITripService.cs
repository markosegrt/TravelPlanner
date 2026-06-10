using Common.DTOs;
using Microsoft.ServiceFabric.Services.Remoting;

namespace Common.Interfaces
{
    public interface ITripService : IService
    {
        // Trips
        Task<List<TripDto>> GetTripsByUserAsync(int userId);
        Task<TripDetailDto?> GetTripDetailAsync(int tripId, int userId);
        Task<TripDto> CreateTripAsync(CreateTripDto dto, int userId);
        Task<TripDto?> UpdateTripAsync(int tripId, UpdateTripDto dto, int userId);
        Task<bool> DeleteTripAsync(int tripId, int userId);

        // Destinations
        Task<List<DestinationDto>> GetDestinationsAsync(int tripId);
        Task<DestinationDto> CreateDestinationAsync(int tripId, CreateDestinationDto dto);
        Task<DestinationDto?> UpdateDestinationAsync(int tripId, int destinationId, UpdateDestinationDto dto);
        Task<bool> DeleteDestinationAsync(int tripId, int destinationId);

        // Activities
        Task<List<ActivityDto>> GetActivitiesAsync(int tripId);
        Task<ActivityDto> CreateActivityAsync(int tripId, CreateActivityDto dto);
        Task<ActivityDto?> UpdateActivityAsync(int tripId, int activityId, UpdateActivityDto dto);
        Task<bool> DeleteActivityAsync(int tripId, int activityId);

        // Checklist
        Task<List<ChecklistItemDto>> GetChecklistAsync(int tripId);
        Task<ChecklistItemDto> CreateChecklistItemAsync(int tripId, CreateChecklistItemDto dto);
        Task<ChecklistItemDto?> UpdateChecklistItemAsync(int tripId, int itemId, UpdateChecklistItemDto dto);
        Task<bool> DeleteChecklistItemAsync(int tripId, int itemId);
    }
}