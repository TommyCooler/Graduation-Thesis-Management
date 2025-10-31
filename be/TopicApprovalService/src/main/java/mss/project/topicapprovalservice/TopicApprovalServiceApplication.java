package mss.project.topicapprovalservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EnableFeignClients
@EnableJpaRepositories(basePackages = "mss.project.topicapprovalservice.repositories")
@SpringBootApplication
public class TopicApprovalServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TopicApprovalServiceApplication.class, args);
    }

}
