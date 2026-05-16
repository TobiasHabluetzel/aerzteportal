# Stage 1 — Build React/Vite frontend
FROM node:20-alpine AS frontend
WORKDIR /app
COPY Aerzteportal.Web/package*.json ./
RUN npm install --no-audit --no-fund
COPY Aerzteportal.Web/ ./
RUN npx vite build --outDir /wwwroot --emptyOutDir

# Stage 2 — Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend
WORKDIR /app
COPY Aerzteportal.Api/*.csproj ./
RUN dotnet restore
COPY Aerzteportal.Api/ ./
COPY --from=frontend /wwwroot ./wwwroot/
RUN dotnet publish -c Release -o /publish

# Stage 3 — Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=backend /publish .
EXPOSE 8080
CMD ["sh", "-c", "ASPNETCORE_HTTP_PORTS=${PORT:-8080} dotnet Aerzteportal.Api.dll"]
