package mss.project.checkplagiarismservice.services;

import mss.project.checkplagiarismservice.dtos.request.UpdateTopicFileUrlRequest;
import mss.project.checkplagiarismservice.dtos.response.TopicDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "topic-approval-service", url = "${topic.service.url}")
public interface TopicService {

    @GetMapping("/api/topics/{topicId}")
    TopicDTO getTopicById(@PathVariable Long topicId);

    @PutMapping("/api/topics/update/{topicId}")
    TopicDTO updateTopic(@PathVariable Long topicId, @RequestBody UpdateTopicFileUrlRequest request);

}
