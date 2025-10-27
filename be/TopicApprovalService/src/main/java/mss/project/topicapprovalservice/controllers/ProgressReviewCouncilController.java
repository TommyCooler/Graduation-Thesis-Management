package mss.project.topicapprovalservice.controllers;

import jakarta.validation.Valid;
import lombok.Getter;
import mss.project.topicapprovalservice.dtos.requests.CreateReviewCouncilRequest;
import mss.project.topicapprovalservice.dtos.responses.*;
import mss.project.topicapprovalservice.services.IProgressReviewCouncilService;
import mss.project.topicapprovalservice.services.ProgressReviewCouncilServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress-review-councils")
public class ProgressReviewCouncilController {

    @Autowired
    private IProgressReviewCouncilService progressReviewCouncilService;

    @PostMapping("/{topicID}")
    public ApiResponse<CreateReviewCouncilResponse> createProgressReviewCouncil(@Valid @RequestBody CreateReviewCouncilRequest request, @PathVariable Long topicID) {
        CreateReviewCouncilResponse result = progressReviewCouncilService.createReviewCouncil(topicID, request);
        return ApiResponse.<CreateReviewCouncilResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Progress Review Council created successfully")
                .data(result)
                .build();
    }

    @GetMapping("/{topicID}")
    public ApiResponse<List<GetAllReviewCouncilResponse>> getAllProgressReviewCouncils(@PathVariable Long topicID) {
        List<GetAllReviewCouncilResponse> result = progressReviewCouncilService.getAllReviewCouncil(topicID);
        return ApiResponse.<List<GetAllReviewCouncilResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Fetched all Progress Review Councils successfully")
                .data(result)
                .build();
    }

    @GetMapping("/{councilId}/members" )
    public ApiResponse<List<GetMemberOfReviewCouncilResponse>> getMembersOfReviewCouncil(@PathVariable Long councilId) {
        List<GetMemberOfReviewCouncilResponse> result = progressReviewCouncilService.getMembersOfCouncil(councilId);
        return ApiResponse.<List<GetMemberOfReviewCouncilResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Fetched members of Progress Review Council successfully")
                .data(result)
                .build();
    }

    @GetMapping("/lecturers")
    public ApiResponse<List<GetAllLecturerResponse>> getAllLecturers() {
        List<GetAllLecturerResponse> result = progressReviewCouncilService.getAllLecturer();
        return ApiResponse.<List<GetAllLecturerResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Fetched all lecturers successfully")
                .data((result))
                .build();
    }



}
