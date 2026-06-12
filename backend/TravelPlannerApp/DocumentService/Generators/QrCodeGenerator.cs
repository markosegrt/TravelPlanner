using QRCoder;

namespace DocumentService.Generators
{
    public static class QrCodeGenerator
    {
        public static string GenerateBase64(string content)
        {
            using var qrGenerator = new QRCodeGenerator();
            using var qrCodeData = qrGenerator.CreateQrCode(content, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrCodeData);

            var pngBytes = qrCode.GetGraphic(10);
            return Convert.ToBase64String(pngBytes);
        }
    }
}