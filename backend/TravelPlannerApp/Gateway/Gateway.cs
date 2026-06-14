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
using Microsoft.OpenApi.Models;
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
                            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

                        builder.Services.AddSingleton<StatelessServiceContext>(serviceContext);

                        builder.WebHost
                            .UseKestrel()
                            .UseContentRoot(Directory.GetCurrentDirectory())
                            .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                            .UseUrls(url);

                        // ====== DbContext ======
                        builder.Services.AddDbContext<AppDbContext>(options =>
                             options.UseSqlServer(DataAccess.DatabaseConfig.ConnectionString));

                        // ====== CORS ======
                        builder.Services.AddCors(options =>
                        {
                            options.AddPolicy("AllowReactApp", policy =>
                            {
                                policy.WithOrigins(
                                        "http://localhost:5173",
                                        "http://localhost:3000")
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

                        // ====== Swagger sa JWT podrškom ======
                        builder.Services.AddSwaggerGen(c =>
                        {
                            var jwtScheme = new OpenApiSecurityScheme
                            {
                                Name = "Authorization",
                                Type = SecuritySchemeType.Http,
                                Scheme = "bearer",
                                BearerFormat = "JWT",
                                In = ParameterLocation.Header,
                                Description = "Enter your JWT token (without 'Bearer' prefix).",
                                Reference = new OpenApiReference
                                {
                                    Type = ReferenceType.SecurityScheme,
                                    Id = "Bearer"
                                }
                            };

                            c.AddSecurityDefinition("Bearer", jwtScheme);
                            c.AddSecurityRequirement(new OpenApiSecurityRequirement
                            {
                                { jwtScheme, Array.Empty<string>() }
                            });
                        });

                        var app = builder.Build();

                        app.UseSwagger();
                        app.UseSwaggerUI();

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