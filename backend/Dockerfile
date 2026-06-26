# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Copia o pom.xml primeiro (cache de dependências)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o restante do código e builda
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copia o jar gerado
COPY --from=builder /app/target/*.jar app.jar

# Porta padrão do Spring Boot
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]