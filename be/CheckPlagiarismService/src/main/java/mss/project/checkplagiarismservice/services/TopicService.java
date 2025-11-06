package mss.project.checkplagiarismservice.services;

import mss.project.checkplagiarismservice.dtos.response.ApiResponse;
import mss.project.checkplagiarismservice.dtos.response.TopicDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(
    name = "topic-service",
    url = "${topic.service.url}"
)
public interface TopicService {

    @GetMapping("/api/topics/{topicId}")
    ApiResponse<TopicDTO> getTopicById(@PathVariable("topicId") Long topicId);

    @PutMapping("/api/topics/update/{topicId}")
    ApiResponse<TopicDTO> updateTopic(
        @PathVariable("topicId") Long topicId, 
        @RequestBody TopicDTO request
    );
}