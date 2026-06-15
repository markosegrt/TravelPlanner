using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Common.DTOs;
using Common.Interfaces;
using Common.Events;
using DataAccess.Entities;
using DataAccess.Mappers;
using TripService.Repositories;

namespace TripService
{
    internal sealed class TripService : StatelessService, ITripService
    {
        private readonly TripRepository _tripRepo = new();
        private readonly DestinationRepository _destRepo = new();
        private readonly ActivityRepository _actRepo = new();
        private readonly ChecklistRepository _checkRepo = new();

        public TripService(StatelessServiceContext context)
            : base(context)
        { }

        //Remoting listener
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return this.CreateServiceRemotingInstanceListeners();
        }

        // ==================== TRIPS ====================
        public async Task<List<TripDto>> GetTripsByUserAsync(int userId)
        {
            var trips = await _tripRepo.GetByUserAsync(userId);
            return trips.Select(t => EntityMappers.ToTripDto(
                t,
                t.Destinations.Count,
                t.Expenses.Sum(e => e.Amount)
            )).ToList();
        }

        public async Task<TripDetailDto?> GetTripDetailAsync(int tripId, int userId)
        {
            var trip = await _tripRepo.GetDetailAsync(tripId, userId);
            if (trip == null) return null;

            var totalSpent = trip.Expenses.Sum(e => e.Amount);

            return EntityMappers.ToTripDetailDto(
                trip,
                trip.Destinations.Select(EntityMappers.ToDestinationDto).ToList(),
                trip.Activities.Select(EntityMappers.ToActivityDto).ToList(),
                trip.Expenses.Select(EntityMappers.ToExpenseDto).ToList(),
                trip.ChecklistItems.Select(EntityMappers.ToChecklistItemDto).ToList(),
                EntityMappers.ToBudgetSummaryDto(trip.PlannedBudget, totalSpent)
            );
        }

        public async Task<TripDto> CreateTripAsync(CreateTripDto dto, int userId)
        {
            if (dto.StartDate.Date < DateTime.UtcNow.Date)
                throw new InvalidOperationException("Start date cannot be in the past.");
            if (dto.EndDate < dto.StartDate)
                throw new InvalidOperationException("End date cannot be before start date.");
            if (dto.PlannedBudget < 0)
                throw new InvalidOperationException("Budget cannot be negative.");

            var trip = new Trip
            {
                Name = dto.Name,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                PlannedBudget = dto.PlannedBudget,
                GeneralNotes = dto.GeneralNotes,
                OwnerUserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            await _tripRepo.AddAsync(trip);

            await EventPublisher.TryPublishAsync(
                "TripCreated",
                $"Trip created: {trip.Name}",
                "TripService",
                userId: userId,
                tripId: trip.Id);

            return EntityMappers.ToTripDto(trip);
        }

        public async Task<TripDto?> UpdateTripAsync(int tripId, UpdateTripDto dto, int userId)
        {

            if (dto.EndDate < dto.StartDate)
                throw new InvalidOperationException("End date cannot be before start date.");
            if (dto.PlannedBudget < 0)
                throw new InvalidOperationException("Budget cannot be negative.");

            var trip = await _tripRepo.UpdateAsync(tripId, userId, t =>
            {
                t.Name = dto.Name;
                t.Description = dto.Description;
                t.StartDate = dto.StartDate;
                t.EndDate = dto.EndDate;
                t.PlannedBudget = dto.PlannedBudget;
                t.GeneralNotes = dto.GeneralNotes;
            });

            if (trip == null) return null;

            return EntityMappers.ToTripDto(
                trip,
                trip.Destinations.Count,
                trip.Expenses.Sum(e => e.Amount)
            );
        }

        public async Task<bool> DeleteTripAsync(int tripId, int userId)
        {
            var deleted = await _tripRepo.DeleteAsync(tripId, userId);

            if (deleted)
            {
                await EventPublisher.TryPublishAsync(
                    "TripDeleted",
                    $"Trip {tripId} deleted",
                    "TripService",
                    userId: userId,
                    tripId: tripId);
            }

            return deleted;
        }

        // ==================== DESTINATIONS ====================

        public async Task<List<DestinationDto>> GetDestinationsAsync(int tripId)
        {
            var destinations = await _destRepo.GetByTripAsync(tripId);
            return destinations.Select(EntityMappers.ToDestinationDto).ToList();
        }

        public async Task<DestinationDto> CreateDestinationAsync(int tripId, CreateDestinationDto dto)
        {
            if (dto.DepartureDate < dto.ArrivalDate)
                throw new InvalidOperationException("Departure date cannot be before arrival date.");

            var bounds = await GetTripBoundsAsync(tripId);
            if (bounds == null)
                throw new InvalidOperationException("Trip not found.");
            if (dto.ArrivalDate.Date < bounds.Value.start.Date || dto.DepartureDate.Date > bounds.Value.end.Date)
                throw new InvalidOperationException("Destination dates must be within the trip period.");

            var destination = new Destination
            {
                Name = dto.Name,
                Location = dto.Location,
                ArrivalDate = dto.ArrivalDate,
                DepartureDate = dto.DepartureDate,
                Notes = dto.Notes,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                TripId = tripId
            };

            await _destRepo.AddAsync(destination);
            return EntityMappers.ToDestinationDto(destination);
        }

        public async Task<DestinationDto?> UpdateDestinationAsync(int tripId, int destinationId, UpdateDestinationDto dto)
        {
            if (dto.DepartureDate < dto.ArrivalDate)
                throw new InvalidOperationException("Departure date cannot be before arrival date.");

            var bounds = await GetTripBoundsAsync(tripId);
            if (bounds == null)
                throw new InvalidOperationException("Trip not found.");
            if (dto.ArrivalDate.Date < bounds.Value.start.Date || dto.DepartureDate.Date > bounds.Value.end.Date)
                throw new InvalidOperationException("Destination dates must be within the trip period.");

            var destination = await _destRepo.UpdateAsync(tripId, destinationId, d =>
            {
                d.Name = dto.Name;
                d.Location = dto.Location;
                d.ArrivalDate = dto.ArrivalDate;
                d.DepartureDate = dto.DepartureDate;
                d.Notes = dto.Notes;
                d.Latitude = dto.Latitude;
                d.Longitude = dto.Longitude;
            });

            return destination == null ? null : EntityMappers.ToDestinationDto(destination);
        }

        public async Task<bool> DeleteDestinationAsync(int tripId, int destinationId)
        {
            return await _destRepo.DeleteAsync(tripId, destinationId);
        }

        // ==================== ACTIVITIES ====================

        public async Task<List<ActivityDto>> GetActivitiesAsync(int tripId)
        {
            var activities = await _actRepo.GetByTripAsync(tripId);
            return activities.Select(EntityMappers.ToActivityDto).ToList();
        }

        public async Task<ActivityDto> CreateActivityAsync(int tripId, CreateActivityDto dto)
        {
            if (dto.EstimatedCost < 0)
                throw new InvalidOperationException("Estimated cost cannot be negative.");

            var bounds = await GetTripBoundsAsync(tripId);
            if (bounds == null)
                throw new InvalidOperationException("Trip not found.");
            if (dto.Date.Date < bounds.Value.start.Date || dto.Date.Date > bounds.Value.end.Date)
                throw new InvalidOperationException("Activity date must be within the trip period.");

            var activity = new Activity
            {
                Name = dto.Name,
                Date = dto.Date,
                Time = dto.Time,
                Location = dto.Location,
                Description = dto.Description,
                EstimatedCost = dto.EstimatedCost,
                Status = dto.Status,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                TripId = tripId,
                DestinationId = dto.DestinationId
            };

            await _actRepo.AddAsync(activity);
            return EntityMappers.ToActivityDto(activity);
        }

        public async Task<ActivityDto?> UpdateActivityAsync(int tripId, int activityId, UpdateActivityDto dto)
        {
            if (dto.EstimatedCost < 0)
                throw new InvalidOperationException("Estimated cost cannot be negative.");

            var bounds = await GetTripBoundsAsync(tripId);
            if (bounds == null)
                throw new InvalidOperationException("Trip not found.");
            if (dto.Date.Date < bounds.Value.start.Date || dto.Date.Date > bounds.Value.end.Date)
                throw new InvalidOperationException("Activity date must be within the trip period.");

            var activity = await _actRepo.UpdateAsync(tripId, activityId, a =>
            {
                a.Name = dto.Name;
                a.Date = dto.Date;
                a.Time = dto.Time;
                a.Location = dto.Location;
                a.Description = dto.Description;
                a.EstimatedCost = dto.EstimatedCost;
                a.Status = dto.Status;
                a.Latitude = dto.Latitude;
                a.Longitude = dto.Longitude;
                a.DestinationId = dto.DestinationId;
            });

            return activity == null ? null : EntityMappers.ToActivityDto(activity);
        }

        public async Task<bool> DeleteActivityAsync(int tripId, int activityId)
        {
            return await _actRepo.DeleteAsync(tripId, activityId);
        }

        // ==================== CHECKLIST ====================

        public async Task<List<ChecklistItemDto>> GetChecklistAsync(int tripId)
        {
            var items = await _checkRepo.GetByTripAsync(tripId);
            return items.Select(EntityMappers.ToChecklistItemDto).ToList();
        }

        public async Task<ChecklistItemDto> CreateChecklistItemAsync(int tripId, CreateChecklistItemDto dto)
        {
            var item = new ChecklistItem
            {
                Name = dto.Name,
                IsCompleted = false,
                TripId = tripId
            };

            await _checkRepo.AddAsync(item);
            return EntityMappers.ToChecklistItemDto(item);
        }

        public async Task<ChecklistItemDto?> UpdateChecklistItemAsync(int tripId, int itemId, UpdateChecklistItemDto dto)
        {
            var item = await _checkRepo.UpdateAsync(tripId, itemId, c =>
            {
                c.Name = dto.Name;
                c.IsCompleted = dto.IsCompleted;
            });

            return item == null ? null : EntityMappers.ToChecklistItemDto(item);
        }

        public async Task<bool> DeleteChecklistItemAsync(int tripId, int itemId)
        {
            return await _checkRepo.DeleteAsync(tripId, itemId);
        }

        private async Task<(DateTime start, DateTime end)?> GetTripBoundsAsync(int tripId)
        {
            var trip = await _tripRepo.GetByIdAsync(tripId);
            if (trip == null) return null;
            return (trip.StartDate, trip.EndDate);
        }

        // ====== ADMIN: sva putovanja svih korisnika ======
        public async Task<List<AdminTripDto>> GetAllTripsForAdminAsync()
        {
            var trips = await _tripRepo.GetAllWithOwnerAsync();
            return trips.Select(t => new AdminTripDto
            {
                Id = t.Id,
                Name = t.Name,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                PlannedBudget = t.PlannedBudget,
                TotalSpent = t.Expenses.Sum(e => e.Amount),
                DestinationCount = t.Destinations.Count,
                OwnerUserId = t.OwnerUserId,
                OwnerName = t.Owner?.Name ?? "Unknown",
                OwnerEmail = t.Owner?.Email ?? ""
            }).ToList();
        }
    }
}