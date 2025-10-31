package mss.project.checkplagiarismservice.services;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "account-service", url = "${account.service.url}")
public interface AccountService {

    @GetMapping("/v1/account/{accountId}")
    Long getAccountId(@PathVariable String accountId);

}
