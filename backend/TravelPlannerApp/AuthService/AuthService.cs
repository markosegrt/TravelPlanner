using System;
using System.Collections.Generic;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Common.DTOs;
using Common.Enums;
using Common.Interfaces;
using DataAccess.Entities;
using DataAccess.Mappers;
using AuthService.Helpers;
using AuthService.Repositories;

namespace AuthService
{
    internal sealed class AuthService : StatelessService, IAuthService
    {
        private readonly UserRepository _userRepo = new();

        public AuthService(StatelessServiceContext context)
            : base(context)
        { }

        // Remoting listener
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return this.CreateServiceRemotingInstanceListeners();
        }

        // ====== REGISTRACIJA ======
        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            if (await _userRepo.ExistsByEmailAsync(dto.Email))
                throw new InvalidOperationException("User with this email already exists.");

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Role = UserRole.User,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            user.PasswordHash = PasswordHelper.Hash(user, dto.Password);
            await _userRepo.AddAsync(user);

            return new AuthResponseDto
            {
                Token = JwtHelper.GenerateToken(user),
                User = EntityMappers.ToUserDto(user)
            };
        }

        // ====== LOGIN ======
        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userRepo.FindByEmailAsync(dto.Email);

            if (user == null || !user.IsActive)
                throw new InvalidOperationException("Invalid email or password.");

            if (!PasswordHelper.Verify(user, user.PasswordHash, dto.Password))
                throw new InvalidOperationException("Invalid email or password.");

            return new AuthResponseDto
            {
                Token = JwtHelper.GenerateToken(user),
                User = EntityMappers.ToUserDto(user)
            };
        }

        // ====== GET USER BY ID ======
        public async Task<UserDto?> GetUserByIdAsync(int userId)
        {
            var user = await _userRepo.FindByIdAsync(userId);
            return user == null ? null : EntityMappers.ToUserDto(user);
        }

        // ====== GET ALL USERS (Admin) ======
        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepo.GetAllAsync();
            return users.Select(EntityMappers.ToUserDto).ToList();
        }

        // ====== UPDATE USER STATUS (Admin — activate/deactivate) ======
        public async Task<bool> UpdateUserStatusAsync(int userId, bool isActive)
        {
            return await _userRepo.UpdateStatusAsync(userId, isActive);
        }

        // ====== TOKEN VALIDACIJA ======
        public Task<bool> ValidateTokenAsync(string token)
        {
            return Task.FromResult(JwtHelper.ValidateToken(token));
        }

        // ====== EXTRACT USER ID FROM JWT ======
        public Task<int?> GetUserIdFromTokenAsync(string jwtToken)
        {
            return Task.FromResult(JwtHelper.GetUserIdFromToken(jwtToken));
        }
    }
}