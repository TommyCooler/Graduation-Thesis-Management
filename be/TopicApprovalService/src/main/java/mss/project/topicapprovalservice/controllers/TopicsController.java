package mss.project.topicapprovalservice.controllers;

import mss.project.topicapprovalservice.dtos.responses.*;
import mss.project.topicapprovalservice.dtos.requests.TopicsDTORequest;
import mss.project.topicapprovalservice.enums.TopicStatus;
import mss.project.topicapprovalservice.services.TopicService;
import mss.project.topicapprovalservice.services.TopicHistoryService;
import mss.project.topicapprovalservice.services.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/api/topics")
@RestController
public class TopicsController {

    @Autowired
    private TopicService topicsService;
    
    @Autowired
    private TopicHistoryService topicHistoryService;
    
    @Autowired
    private AccountService accountService;

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

    @PostMapping("/{topicId}/members/{accountId}")
    public ApiResponse<AccountTopicsDTOResponse> addTopicMember(
            @PathVariable Long topicId,
            @PathVariable Long accountId,
            @AuthenticationPrincipal Jwt jwt) {
        
        // Lấy thông tin account từ AccountService
        AccountDTO account = accountService.getAccountById(accountId);
        String accountName = account.getName() != null ? account.getName() : account.getEmail();
        
        AccountTopicsDTOResponse result = topicsService.addTopicMember(topicId, accountId, accountName);
        
        ApiResponse<AccountTopicsDTOResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Member added successfully");
        apiResponse.setData(result);
        return apiResponse;
    }

    @DeleteMapping("/{topicId}/members/{accountId}")
    public ApiResponse<Void> removeTopicMember(
            @PathVariable Long topicId,
            @PathVariable Long accountId) {
        topicsService.removeTopicMember(topicId, accountId);
        
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Member removed successfully");
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

    @GetMapping("topic-count")
    public ApiResponse<List<TopicsWithCouncilIsNullResponse>>getTopicCount() {
        List<TopicsWithCouncilIsNullResponse> topicsDTOResponses= topicsService.getTopicsByCouncilNotNull();
        if(topicsDTOResponses.isEmpty()) {
            ApiResponse<List<TopicsWithCouncilIsNullResponse>> apiResponse = new ApiResponse<>();
            apiResponse.setCode(404);
            apiResponse.setMessage("No topics found with non-null council");
            apiResponse.setData(topicsDTOResponses);
            return apiResponse;
        }
        ApiResponse<List<TopicsWithCouncilIsNullResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Total Topic Count Retrieved Successfully");
        apiResponse.setData(topicsDTOResponses);
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
    public ApiResponse<List<GetAllApprovedTopicsResponse>> getApprovedTopics( @AuthenticationPrincipal Jwt jwt) {
        Long accountID = null;
        if (jwt != null) {
            try {
                accountID = Long.parseLong(jwt.getSubject());
            } catch (NumberFormatException e) {
                System.err.println("Failed to parse accountId from JWT subject: " + jwt.getSubject());
            }
        }
        List<GetAllApprovedTopicsResponse> result = topicsService.getApprovedTopics(accountID);
        return ApiResponse.<List<GetAllApprovedTopicsResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Fetch all approved topics successfully")
                .data(result)
                .build();
    }
    
    @GetMapping("/by-status")
    public ApiResponse<List<TopicsDTOResponse>> getTopicsByStatus(
            @RequestParam String status) {
        try {
            TopicStatus topicStatus = TopicStatus.valueOf(status.toUpperCase());
            List<TopicsDTOResponse> topics = topicsService.getTopicsByStatus(topicStatus);
            ApiResponse<List<TopicsDTOResponse>> apiResponse = new ApiResponse<>();
            apiResponse.setCode(200);
            apiResponse.setMessage("Topics with status " + status + " retrieved successfully");
            apiResponse.setData(topics);
            return apiResponse;
        } catch (IllegalArgumentException e) {
            ApiResponse<List<TopicsDTOResponse>> apiResponse = new ApiResponse<>();
            apiResponse.setCode(400);
            apiResponse.setMessage("Invalid status value. Valid values: DRAFT, PENDING, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED");
            apiResponse.setData(null);
            return apiResponse;
        }
    }

    @GetMapping("/my-topics")
    public ApiResponse<List<TopicsDTOResponse>> getMyTopics(
            @AuthenticationPrincipal Jwt jwt) {
        
        // Lấy ID người dùng đăng nhập từ JWT
        Long creatorId = null;
        
        if (jwt != null) {
            try {
                String subject = jwt.getSubject();
                System.out.println("JWT Subject: " + subject);
                creatorId = Long.parseLong(subject);
                System.out.println("Parsed creatorId: " + creatorId);
            } catch (NumberFormatException e) {
                System.err.println("Failed to parse accountId from JWT subject: " + jwt.getSubject());
            }
        } else {
            System.err.println("JWT is null");
        }
        
        if (creatorId == null) {
            ApiResponse<List<TopicsDTOResponse>> apiResponse = new ApiResponse<>();
            apiResponse.setCode(401);
            apiResponse.setMessage("User not authenticated");
            apiResponse.setData(List.of());
            return apiResponse;
        }
        
        List<TopicsDTOResponse> topics = topicsService.getTopicsByCreatorId(creatorId);
        System.out.println("Found " + topics.size() + " topics for creatorId: " + creatorId);
        
        ApiResponse<List<TopicsDTOResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("My topics retrieved successfully");
        apiResponse.setData(topics);
        return apiResponse;
    }

    // ========== 2-Person Approval Workflow Endpoints ==========

    @PostMapping("/approve-v2/{id}")
    public ApiResponse<TopicWithApprovalStatusResponse> approveTopicV2(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> requestBody,
            @AuthenticationPrincipal Jwt jwt) {
        
        String approverEmail = jwt.getClaimAsString("email");
        String approverName = jwt.getClaimAsString("name");
        if (approverName == null || approverName.isEmpty()) {
            approverName = jwt.getClaimAsString("preferred_username");
        }
        
        String comment = requestBody != null ? requestBody.get("comment") : null;
        
        TopicWithApprovalStatusResponse result = topicsService.approveTopicV2(id, approverEmail, approverName, comment);
        
        ApiResponse<TopicWithApprovalStatusResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Topic approved successfully. Approval status: " + result.getApprovalStatus());
        apiResponse.setData(result);
        return apiResponse;
    }

    @GetMapping("/pending-for-approval")
    public ApiResponse<List<TopicWithApprovalStatusResponse>> getPendingTopicsForApproval(
            @AuthenticationPrincipal Jwt jwt) {
        
        String userEmail = jwt.getClaimAsString("email");
        List<TopicWithApprovalStatusResponse> topics = topicsService.getPendingTopicsForApproval(userEmail);
        
        ApiResponse<List<TopicWithApprovalStatusResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Pending topics for approval retrieved successfully");
        apiResponse.setData(topics);
        return apiResponse;
    }

    @GetMapping("/my-approved")
    public ApiResponse<List<TopicWithApprovalStatusResponse>> getApprovedTopicsByUser(
            @AuthenticationPrincipal Jwt jwt) {
        
        String userEmail = jwt.getClaimAsString("email");
        List<TopicWithApprovalStatusResponse> topics = topicsService.getApprovedTopicsByUser(userEmail);
        
        ApiResponse<List<TopicWithApprovalStatusResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Topics approved by user retrieved successfully");
        apiResponse.setData(topics);
        return apiResponse;
    }

    @GetMapping("/fully-approved")
    public ApiResponse<List<TopicWithApprovalStatusResponse>> getFullyApprovedTopics() {
        List<TopicWithApprovalStatusResponse> topics = topicsService.getFullyApprovedTopics();
        
        ApiResponse<List<TopicWithApprovalStatusResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Fully approved topics retrieved successfully");
        apiResponse.setData(topics);
        return apiResponse;
    }

    @GetMapping("/{topicId}/can-edit")
    public ApiResponse<Map<String, Boolean>> canUserEditTopic(
            @PathVariable Long topicId,
            @AuthenticationPrincipal Jwt jwt) {
        
        boolean canEdit = false;
        
        if (jwt != null) {
            try {
                Long accountId = Long.parseLong(jwt.getSubject());
                canEdit = topicsService.canUserEditTopic(topicId, accountId);
            } catch (NumberFormatException e) {
                // accountId invalid, canEdit remains false
            }
        }
        
        ApiResponse<Map<String, Boolean>> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Edit permission checked successfully");
        apiResponse.setData(Map.of("canEdit", canEdit));
        return apiResponse;
    }


    @PutMapping("/{topicId}/status")
    public ApiResponse<TopicsDTOResponse> updateTopicStatus(
            @PathVariable Long topicId,
            @RequestParam String status) {

            TopicStatus topicStatus = TopicStatus.valueOf(status.toUpperCase());

            TopicsDTOResponse updated = topicsService.updateTopicStatus(topicId, topicStatus);

            ApiResponse<TopicsDTOResponse> apiResponse = new ApiResponse<>();
            apiResponse.setCode(200);
            apiResponse.setMessage("Topic status updated successfully");
            apiResponse.setData(updated);
            return apiResponse;
    }
}
