package mss.project.checkplagiarismservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class CheckPlagiarismServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CheckPlagiarismServiceApplication.class, args);
    }

}
