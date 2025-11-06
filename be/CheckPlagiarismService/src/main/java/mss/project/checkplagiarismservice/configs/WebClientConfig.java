package mss.project.checkplagiarismservice.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Bean
    WebClient n8nWebClient(@Value("${n8n.base-url}") String baseUrl) {
        String actualBaseUrl = baseUrl.replace("https://localhost", "http://localhost");
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(30));
        return WebClient.builder()
                .baseUrl(actualBaseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }

}

