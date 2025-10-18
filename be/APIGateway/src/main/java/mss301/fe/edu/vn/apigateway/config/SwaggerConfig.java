package mss301.fe.edu.vn.apigateway.config;

import java.util.List;

import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class SwaggerConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("account-service", r -> r.path("/api/account/**")
                        .filters(f -> f.stripPrefix(0))
                        .uri("http://localhost:8081"))
                .route("subject-service", r -> r.path("/api/subject/**")
                        .filters(f -> f.stripPrefix(0))
                        .uri("http://localhost:8082"))
                .route("topic-approval-service", r -> r.path("/api/topic-approval/**")
                        .filters(f -> f.stripPrefix(0))
                        .uri("http://localhost:8083"))
                .route("plagiarism-service", r -> r.path("/api/plagiarism/**")
                        .filters(f -> f.stripPrefix(0))
                        .uri("http://localhost:8084"))
                .build();
    }

    @Bean
    public OpenApiCustomizer useGatewayBase() {
        return openApi -> openApi.setServers(
                List.of(new Server().url("http://localhost:8080"))
        );
    }
}
