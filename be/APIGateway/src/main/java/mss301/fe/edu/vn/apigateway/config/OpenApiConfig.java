package mss301.fe.edu.vn.apigateway.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Graduation Thesis Management System API")
                        .description("API Gateway for Microservices Architecture - Graduation Thesis Management System")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("FPT University")
                                .email("support@fpt.edu.vn")
                                .url("https://www.fpt.edu.vn"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("API Gateway Server")
                ));
    }
}
