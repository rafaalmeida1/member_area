# Build stage
FROM maven:3.9.5-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

# Install netcat for health checks
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Copy the built JAR
COPY --from=build /app/target/nutri_thata_api-0.0.1-SNAPSHOT.jar app.jar

# Copy entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Create uploads directory with proper permissions
RUN mkdir -p storage/uploads && \
    chmod 755 storage/uploads && \
    chown 1000:1000 storage/uploads

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD nc -z localhost 8081 || exit 1

# Run the application
ENTRYPOINT ["./entrypoint.sh"]