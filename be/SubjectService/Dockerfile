FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -ntp -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -ntp -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV JAVA_OPTS=""
ENV SPRING_PROFILES_ACTIVE=docker
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
