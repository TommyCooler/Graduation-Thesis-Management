package mss.project.topicapprovalservice.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Topic Approval Service API")
                        .version("v1")
                        .description("APIs for Topic Approval Service")
                        .contact(new Contact().name("Team").email("team@example.com")));
    }
}
