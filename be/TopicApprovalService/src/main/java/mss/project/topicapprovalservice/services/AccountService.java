package mss.project.topicapprovalservice.services;



import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "account-service", url = "http://localhost:8081")
public interface  AccountService {

    @GetMapping("/api/accounts/{id}")
    boolean existsById(@PathVariable Long id);
}
