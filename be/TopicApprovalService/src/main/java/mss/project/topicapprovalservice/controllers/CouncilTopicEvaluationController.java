package mss.project.topicapprovalservice.controllers;


import jakarta.validation.Valid;
import mss.project.topicapprovalservice.dtos.requests.CouncilTopicNoteRequest;
import mss.project.topicapprovalservice.dtos.responses.ApiResponse;
import mss.project.topicapprovalservice.dtos.responses.CouncilTopicNoteResponse;
import mss.project.topicapprovalservice.services.ICouncilTopicEvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/council-topic-evaluations")
public class CouncilTopicEvaluationController {

    @Autowired
    private ICouncilTopicEvaluationService evaluationService;

    @PostMapping("/create")
    public ApiResponse<CouncilTopicNoteResponse> upsertNote(@Valid @RequestBody CouncilTopicNoteRequest request) {
        CouncilTopicNoteResponse result = evaluationService.upsertNote(request);
        return ApiResponse.<CouncilTopicNoteResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Saved note successfully")
                .data(result)
                .build();
    }

    @GetMapping("/by-topic/{topicId}")
    public ApiResponse<List<CouncilTopicNoteResponse>> getNotesByTopic(@PathVariable Long topicId) {
        List<CouncilTopicNoteResponse> result = evaluationService.getNotesByTopic(topicId);
        return ApiResponse.<List<CouncilTopicNoteResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Fetched notes by topic successfully")
                .data(result)
                .build();
    }

    @GetMapping("/by-member/{councilMemberId}")
    public ApiResponse<List<CouncilTopicNoteResponse>> getNotesByMember(@PathVariable Long councilMemberId) {
        List<CouncilTopicNoteResponse> result = evaluationService.getNotesByMember(councilMemberId);
        return ApiResponse.<List<CouncilTopicNoteResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Fetched notes by member successfully")
                .data(result)
                .build();
    }
}
