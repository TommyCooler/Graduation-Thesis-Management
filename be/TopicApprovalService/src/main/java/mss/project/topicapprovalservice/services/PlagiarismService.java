package mss.project.topicapprovalservice.services;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "check-plagiarism-service", url = "${plagiarism.service.url:http://localhost:8080}")
public interface PlagiarismService {

    @PostMapping("/plagiarism-service/api/plagiarism/delete-topic-qdrant")
    void deleteTopicFromQdrant(@RequestParam("topicId") Long topicId);
}

