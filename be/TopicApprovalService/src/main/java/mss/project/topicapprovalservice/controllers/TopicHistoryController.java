package mss.project.topicapprovalservice.controllers;

import lombok.RequiredArgsConstructor;
import mss.project.topicapprovalservice.dtos.responses.ApiResponse;
import mss.project.topicapprovalservice.dtos.responses.TopicHistoryDTOResponse;
import mss.project.topicapprovalservice.services.TopicHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topic-history")
@RequiredArgsConstructor
public class TopicHistoryController {
    
    private final TopicHistoryService topicHistoryService;
    
    @GetMapping("/topic/{topicId}")
    public ResponseEntity<ApiResponse<List<TopicHistoryDTOResponse>>> getTopicHistory(
            @PathVariable Long topicId) {
        List<TopicHistoryDTOResponse> history = topicHistoryService.getTopicHistory(topicId);
        return ResponseEntity.ok(ApiResponse.<List<TopicHistoryDTOResponse>>builder()
                .code(200)
                .message("Lấy lịch sử thay đổi topic thành công")
                .data(history)
                .build());
    }
    
    @GetMapping("/user/{username}")
    public ResponseEntity<ApiResponse<List<TopicHistoryDTOResponse>>> getHistoryByUser(
            @PathVariable String username) {
        List<TopicHistoryDTOResponse> history = topicHistoryService.getHistoryByUser(username);
        return ResponseEntity.ok(ApiResponse.<List<TopicHistoryDTOResponse>>builder()
                .code(200)
                .message("Lấy lịch sử thay đổi của người dùng thành công")
                .data(history)
                .build());
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<TopicHistoryDTOResponse>>> getAllTopicHistory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        // For now, return all history. You can add filtering logic later
        List<TopicHistoryDTOResponse> history = topicHistoryService.getAllTopicHistory();
        return ResponseEntity.ok(ApiResponse.<List<TopicHistoryDTOResponse>>builder()
                .code(200)
                .message("Lấy tất cả lịch sử thay đổi thành công")
                .data(history)
                .build());
    }
}