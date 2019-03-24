using Eshop.Configurations;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Eshop
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.SetUpAutoMapper();
            services.AddAllDependencies();
            services.SetUpDatabase(Configuration);
            services.AddCors();
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            app.UseStaticFiles()
                .UseMiddleware<CustomExceptionMiddleware>()
                .UseCors(builder => builder.WithOrigins("http://localhost:3000"))
                .UseHttpsRedirection()
                .UseMvc()
                .Run(_notFoundHandler);
            app.InitializeDatabase();
        }

        private readonly RequestDelegate _notFoundHandler =
            async ctx =>
            {
                ctx.Response.StatusCode = 404;
                await ctx.Response.WriteAsync("Page not found.");
            };
    }
}