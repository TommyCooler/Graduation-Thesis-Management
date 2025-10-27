package mss.project.topicapprovalservice.controllers;

import mss.project.topicapprovalservice.dtos.requests.TopicsDTORequest;
import mss.project.topicapprovalservice.dtos.responses.ApiResponse;
import mss.project.topicapprovalservice.dtos.responses.GetAllApprovedTopicsResponse;
import mss.project.topicapprovalservice.dtos.responses.TopicsDTOResponse;
import mss.project.topicapprovalservice.services.AccountTopicsServiceImpl;
import mss.project.topicapprovalservice.services.TopicService;
import mss.project.topicapprovalservice.services.TopicHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/topics")
@RestController
public class TopicsController {

    @Autowired
    private TopicService topicsService;

    @Autowired
    private AccountTopicsServiceImpl accountTopicsService;
    
    @Autowired
    private TopicHistoryService topicHistoryService;

    @PostMapping("/create")
    public ApiResponse<TopicsDTOResponse> createTopic(
            @RequestBody TopicsDTORequest topicsDTO, 
            @AuthenticationPrincipal Jwt jwt) {
        TopicsDTOResponse saved = topicsService.createTopic(topicsDTO);
        
        // Only assign to account if JWT is present (authenticated user)
        if (jwt != null && jwt.getSubject() != null) {
            Long accountId = Long.parseLong(jwt.getSubject());
            accountTopicsService.assignTopicToAccount(accountId, saved.getId());
        }
        
        ApiResponse<TopicsDTOResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Topic Created");
        apiResponse.setData(saved);
        return apiResponse;
    }

    @PutMapping("/update/{id}")
    public ApiResponse<TopicsDTOResponse> updateTopic(
            @PathVariable Long id, 
            @RequestBody TopicsDTORequest topicsDTO,
            @AuthenticationPrincipal Jwt jwt) {
        
        // Lấy username từ JWT
        String username = jwt != null ? jwt.getClaimAsString("sub") : "anonymous";
        
        // Sử dụng TopicHistoryService để update và tự động lưu lịch sử
        topicHistoryService.updateTopic(id, topicsDTO, username);
        
        // Lấy topic đã update để trả về
        TopicsDTOResponse updated = topicsService.getTopicbById(id);
        
        ApiResponse<TopicsDTOResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Topic Updated Successfully");
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
    public ApiResponse<List<TopicsDTOResponse>> getAllTopics() {
        List<TopicsDTOResponse> topicsDTOResponses = topicsService.getAllTopics();
        ApiResponse<List<TopicsDTOResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("All Topics");
        apiResponse.setData(topicsDTOResponses);
        return apiResponse;
    }

    @GetMapping
    public ApiResponse<List<TopicsDTOResponse>> getTopicsWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // For now, return all topics (pagination can be implemented later)
        List<TopicsDTOResponse> topicsDTOResponses = topicsService.getAllTopics();
        ApiResponse<List<TopicsDTOResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Topics retrieved successfully");
        apiResponse.setData(topicsDTOResponses);
        return apiResponse;
    }

    @PutMapping("/approve/{id}")
    public ApiResponse<TopicsDTOResponse> approveTopic(
        @PathVariable Long id, 
        @RequestParam String email) {
        TopicsDTOResponse approved = topicsService.approveTopic(id, email);
        ApiResponse<TopicsDTOResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Topic Approved by Head of Department");
        apiResponse.setData(approved);
        return apiResponse;
    }
    
    @PutMapping("/reject/{id}")
    public ApiResponse<TopicsDTOResponse> rejectTopic(
        @PathVariable Long id, 
        @RequestParam String email) {
        TopicsDTOResponse rejected = topicsService.rejectTopic(id, email);
        ApiResponse<TopicsDTOResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Topic Rejected by Head of Department");
        apiResponse.setData(rejected);
        return apiResponse;
    }

    @GetMapping("/approved")
    public ApiResponse<List<GetAllApprovedTopicsResponse>> getApprovedTopics() {
        List<GetAllApprovedTopicsResponse> result = topicsService.getApprovedTopics();
        return ApiResponse.<List<GetAllApprovedTopicsResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Fetch all approved topics successfully")
                .data(result)
                .build();
    }
}
