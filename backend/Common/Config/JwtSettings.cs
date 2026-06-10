namespace Common.Config
{
    public static class JwtSettings
    {
        public const string SecretKey = "TravelPlanner-SuperSecret-Key-That-Is-Long-Enough-For-256-Bits!!";
        public const string Issuer = "TravelPlannerApp";
        public const string Audience = "TravelPlannerFrontend";
        public const int ExpirationMinutes = 480; 
    }
}