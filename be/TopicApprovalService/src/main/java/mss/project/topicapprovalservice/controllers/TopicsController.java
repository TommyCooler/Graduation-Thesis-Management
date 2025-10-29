package mss.project.topicapprovalservice.controllers;

import mss.project.topicapprovalservice.dtos.requests.TopicsDTORequest;
import mss.project.topicapprovalservice.dtos.responses.ApiResponse;
import mss.project.topicapprovalservice.dtos.responses.GetAllApprovedTopicsResponse;
import mss.project.topicapprovalservice.dtos.responses.TopicsDTOResponse;
import mss.project.topicapprovalservice.dtos.responses.AccountTopicsDTOResponse;
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
    private TopicHistoryService topicHistoryService;

    @PostMapping("/create")
    public ApiResponse<TopicsDTOResponse> createTopic(
            @RequestBody TopicsDTORequest topicsDTO, 
            @AuthenticationPrincipal Jwt jwt) {
        
        // Lấy thông tin người tạo từ JWT
        Long creatorId = null;
        String creatorName = "anonymous";
        
        if (jwt != null) {
            try {
                creatorId = Long.parseLong(jwt.getSubject());
                creatorName = jwt.getClaimAsString("name");
                if (creatorName == null || creatorName.isEmpty()) {
                    creatorName = jwt.getClaimAsString("preferred_username");
                }
            } catch (NumberFormatException e) {
                System.err.println("Failed to parse accountId from JWT subject: " + jwt.getSubject());
            }
        }
        
        // Tạo topic và tự động lưu AccountTopics với role CREATOR
        TopicsDTOResponse saved = topicsService.createTopic(topicsDTO, creatorId, creatorName);
        
        ApiResponse<TopicsDTOResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(201);
        apiResponse.setMessage("Topic Created Successfully");
        apiResponse.setData(saved);
        return apiResponse;
    }

    @PostMapping("/{topicId}/join")
    public ApiResponse<AccountTopicsDTOResponse> joinTopic(
            @PathVariable Long topicId,
            @AuthenticationPrincipal Jwt jwt) {
        
        // Lấy thông tin người tham gia từ JWT
        Long memberId = null;
        String memberName = "anonymous";
        
        if (jwt != null) {
            try {
                memberId = Long.parseLong(jwt.getSubject());
                memberName = jwt.getClaimAsString("name");
                if (memberName == null || memberName.isEmpty()) {
                    memberName = jwt.getClaimAsString("preferred_username");
                }
            } catch (NumberFormatException e) {
                System.err.println("Failed to parse accountId from JWT subject: " + jwt.getSubject());
            }
        }
        
        // Tham gia topic với role MEMBER
        AccountTopicsDTOResponse result = topicsService.joinTopic(topicId, memberId, memberName);
        
        ApiResponse<AccountTopicsDTOResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Successfully joined the topic");
        apiResponse.setData(result);
        return apiResponse;
    }

    @GetMapping("/{topicId}/members")
    public ApiResponse<List<AccountTopicsDTOResponse>> getTopicMembers(@PathVariable Long topicId) {
        List<AccountTopicsDTOResponse> members = topicsService.getTopicMembers(topicId);
        
        ApiResponse<List<AccountTopicsDTOResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Topic members retrieved successfully");
        apiResponse.setData(members);
        return apiResponse;
    }

    @PutMapping("/update/{id}")
    public ApiResponse<TopicsDTOResponse> updateTopic(
            @PathVariable Long id, 
            @RequestBody TopicsDTORequest topicsDTO,
            @AuthenticationPrincipal Jwt jwt) {
        
        // Lấy tên người dùng từ JWT claim "name"
        String username = jwt != null ? jwt.getClaimAsString("name") : "anonymous";
        
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
        apiResponse.setCode(200);
        apiResponse.setMessage("Topic Found");
        apiResponse.setData(topicsDTO);
        return apiResponse;
    }

    @DeleteMapping("/delete/{id}")
    public ApiResponse<Void> deleteTopic(@PathVariable Long id) {
        topicsService.deleteTopic(id);
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Topic Deleted Successfully");
        return apiResponse;
    }

    @GetMapping("/all")
    public ApiResponse<List<TopicsDTOResponse>> getAllTopics() {
        List<TopicsDTOResponse> topicsDTOResponses = topicsService.getAllTopics();
        ApiResponse<List<TopicsDTOResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("All Topics Retrieved Successfully");
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
        apiResponse.setCode(200);
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
        apiResponse.setCode(200);
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
        apiResponse.setCode(200);
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
