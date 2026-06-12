using Common.DTOs;
using Common.Enums;
using Microsoft.ServiceFabric.Services.Remoting;

namespace Common.Interfaces
{
    public interface IAuthService : IService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task<UserDto?> GetUserByIdAsync(int userId);
        Task<List<UserDto>> GetAllUsersAsync();
        Task<bool> UpdateUserStatusAsync(int userId, bool isActive);
        Task<bool> ValidateTokenAsync(string token);
        Task<int?> GetUserIdFromTokenAsync(string jwtToken);
        Task<ShareTokenDto> CreateShareTokenAsync(int tripId, AccessLevel accessLevel);
        Task<ShareTokenDto?> ValidateShareTokenAsync(string token);
    }
}