package mss.project.checkplagiarismservice.services;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "topic-approval-service", url = "${topic.service.url}")
public interface TopicService {

    @GetMapping("/v1/topic/{topicId}")
    Long topicId(@RequestParam Long topicId);

}
