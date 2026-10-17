# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/ClearVoice.Api/ClearVoice.Api.csproj", "src/ClearVoice.Api/"]
COPY ["src/ClearVoice.Application/ClearVoice.Application.csproj", "src/ClearVoice.Application/"]
COPY ["src/ClearVoice.Domain/ClearVoice.Domain.csproj", "src/ClearVoice.Domain/"]
COPY ["src/ClearVoice.Infrastructure/ClearVoice.Infrastructure.csproj", "src/ClearVoice.Infrastructure/"]

RUN dotnet restore "src/ClearVoice.Api/ClearVoice.Api.csproj"

COPY src/ src/
WORKDIR "/src/src/ClearVoice.Api"
RUN dotnet publish "ClearVoice.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ClearVoice.Api.dll"]
