package mss.project.topicapprovalservice.controllers;



import mss.project.topicapprovalservice.dtos.requests.TopicsDTORequest;
import mss.project.topicapprovalservice.dtos.responses.ApiResponse;
import mss.project.topicapprovalservice.dtos.responses.TopicsDTOResponse;
import mss.project.topicapprovalservice.services.AccountTopicsServiceImpl;
import mss.project.topicapprovalservice.services.TopicsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping
@RestController("/api/topics")
public class TopicsController {

    @Autowired
    private TopicsServiceImpl topicsService;

    @Autowired
    private AccountTopicsServiceImpl accountTopicsService;

    @PostMapping("/create")
    public ApiResponse<TopicsDTOResponse> createTopic(@RequestBody TopicsDTORequest topicsDTO, @RequestParam Long accountId) {
        TopicsDTOResponse saved = topicsService.createTopic(topicsDTO);
        accountTopicsService.assignTopicToAccount(1L, saved.getId());
         ApiResponse<TopicsDTOResponse> apiResponse = new ApiResponse<>();
         apiResponse.setMessage("Topic Created");
         apiResponse.setData(saved);
         return apiResponse;
    }

    @PutMapping("/update/{id}")
    public ApiResponse<TopicsDTOResponse> updateTopic(@PathVariable Long id, @RequestBody TopicsDTORequest topicsDTO, @RequestParam Long accountId) {
        TopicsDTOResponse updated = topicsService.updateTopic(id, topicsDTO);
        accountTopicsService.assignTopicToAccount(accountId, updated.getId());
        ApiResponse<TopicsDTOResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Topic Updated");
        apiResponse.setData(updated);
        return apiResponse;
    }

    @GetMapping("/{id}")
    public ApiResponse<TopicsDTOResponse> getTopicById(@PathVariable Long id) {
        TopicsDTOResponse topicsDTO = topicsService.getTopicbById(id);
        ApiResponse<TopicsDTOResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Topic Found");
        apiResponse.setData(topicsDTO);
        return apiResponse;
    }

    @DeleteMapping("/delete/{id}")
    public ApiResponse<TopicsDTOResponse> deleteTopic(@PathVariable Long id) {
        topicsService.deleteTopic(id);
        ApiResponse<TopicsDTOResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Topic Deleted");
        return apiResponse;
    }

    @GetMapping("/all")
    public ApiResponse<TopicsDTOResponse> getAllTopics() {
        ApiResponse<TopicsDTOResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("All Topics");
        return apiResponse;
    }
}
