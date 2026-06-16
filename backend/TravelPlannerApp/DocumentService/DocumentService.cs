using System;
using System.Collections.Generic;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Common.DTOs;
using Common.Interfaces;
using DocumentService.Generators;

namespace DocumentService
{
    internal sealed class DocumentService : StatelessService, IDocumentService
    {
        public DocumentService(StatelessServiceContext context)
            : base(context)
        { }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return this.CreateServiceRemotingInstanceListeners();
        }

        // ====== PDF REPORT ======
        public Task<byte[]> GeneratePdfReportAsync(TripDetailDto tripDetail, string shareUrl)
        {
            var pdfBytes = PdfGenerator.Generate(tripDetail, shareUrl);
            return Task.FromResult(pdfBytes);
        }

        // ====== QR CODE ======
        public Task<string> GenerateQrCodeBase64Async(string content)
        {
            var base64 = QrCodeGenerator.GenerateBase64(content);
            return Task.FromResult(base64);
        }
    }
}