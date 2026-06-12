using System;
using System.Collections.Generic;
using System.Fabric;
using System.IO;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Common.Config;
using DataAccess;

namespace Gateway
{
    internal sealed class Gateway : StatelessService
    {
        public Gateway(StatelessServiceContext context)
            : base(context)
        { }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return new ServiceInstanceListener[]
            {
                new ServiceInstanceListener(serviceContext =>
                    new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, listener) =>
                    {
                        ServiceEventSource.Current.ServiceMessage(serviceContext, $"Starting Kestrel on {url}");

                        var builder = WebApplication.CreateBuilder();

                        builder.Configuration
                            .SetBasePath(Directory.GetCurrentDirectory())
                            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

                        builder.Services.AddSingleton<StatelessServiceContext>(serviceContext);

                        builder.WebHost
                            .UseKestrel()
                            .UseContentRoot(Directory.GetCurrentDirectory())
                            .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                            .UseUrls(url);

                        // ====== DbContext ======
                        builder.Services.AddDbContext<AppDbContext>(options =>
                            options.UseSqlServer(builder.Configuration
                                .GetConnectionString("DefaultConnection")));

                        // ====== CORS ======
                        builder.Services.AddCors(options =>
                        {
                            options.AddPolicy("AllowReactApp", policy =>
                            {
                                policy.WithOrigins(
                                        "http://localhost:5173",   // Vite default
                                        "http://localhost:3000")   // CRA fallback
                                    .AllowAnyHeader()
                                    .AllowAnyMethod()
                                    .AllowCredentials();
                            });
                        });

                        // ====== JWT Authentication ======
                        builder.Services.AddAuthentication(options =>
                        {
                            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                        })
                        .AddJwtBearer(options =>
                        {
                            options.TokenValidationParameters = new TokenValidationParameters
                            {
                                ValidateIssuerSigningKey = true,
                                IssuerSigningKey = new SymmetricSecurityKey(
                                    Encoding.UTF8.GetBytes(JwtSettings.SecretKey)),
                                ValidateIssuer = true,
                                ValidIssuer = JwtSettings.Issuer,
                                ValidateAudience = true,
                                ValidAudience = JwtSettings.Audience,
                                ValidateLifetime = true,
                                ClockSkew = TimeSpan.Zero
                            };
                        });

                        builder.Services.AddAuthorization();

                        builder.Services.AddControllers();
                        builder.Services.AddEndpointsApiExplorer();
                        builder.Services.AddSwaggerGen();

                        var app = builder.Build();

                        if (app.Environment.IsDevelopment())
                        {
                            app.UseSwagger();
                            app.UseSwaggerUI();
                        }

                        app.UseCors("AllowReactApp");
                        app.UseAuthentication();
                        app.UseAuthorization();

                        app.MapControllers();

                        return app;
                    }))
            };
        }
    }
}