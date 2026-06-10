using Common.DTOs;
using Microsoft.ServiceFabric.Services.Remoting;

namespace Common.Interfaces
{
    public interface IDocumentService : IService
    {
        Task<byte[]> GeneratePdfReportAsync(TripDetailDto tripDetail);
        Task<string> GenerateQrCodeBase64Async(string content);
    }
}