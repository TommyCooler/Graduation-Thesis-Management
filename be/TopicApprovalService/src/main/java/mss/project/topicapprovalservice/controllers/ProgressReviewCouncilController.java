package mss.project.topicapprovalservice.controllers;

import jakarta.validation.Valid;
import mss.project.topicapprovalservice.dtos.requests.CreateReviewCouncilRequest;
import mss.project.topicapprovalservice.dtos.responses.*;
import mss.project.topicapprovalservice.services.IProgressReviewCouncilService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress-review-councils")
public class ProgressReviewCouncilController {

    @Autowired
    private IProgressReviewCouncilService progressReviewCouncilService;

    @PostMapping("/topic/{topicID}")
    public ApiResponse<CreateReviewCouncilResponse> createProgressReviewCouncil(@Valid @RequestBody CreateReviewCouncilRequest request, @PathVariable Long topicID) {
        CreateReviewCouncilResponse result = progressReviewCouncilService.createReviewCouncil(topicID, request);
        return ApiResponse.<CreateReviewCouncilResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Progress Review Council created successfully")
                .data(result)
                .build();
    }

    @GetMapping("/topic/{topicID}")
    public ApiResponse<List<GetReviewCouncilResponse>> getAllProgressReviewCouncils(@PathVariable Long topicID) {
        List<GetReviewCouncilResponse> result = progressReviewCouncilService.getAllReviewCouncil(topicID);
        return ApiResponse.<List<GetReviewCouncilResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Fetched all Progress Review Councils successfully")
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



    @GetMapping
    public ApiResponse<List<GetReviewCouncilResponse>> getAllReviewCouncilsForCalendar() {
        List<GetReviewCouncilResponse> result = progressReviewCouncilService.getAllReviewCouncilForCalendar();
        return ApiResponse.<List<GetReviewCouncilResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Fetched all Progress Review Councils successfully")
                .data(result)
                .build();
    }

    @GetMapping("/{councilID}")
    public ApiResponse<GetReviewCouncilResponse> getReviewCouncil(@PathVariable Long councilID) {
        GetReviewCouncilResponse result = progressReviewCouncilService.getReviewCouncil(councilID);
        return ApiResponse.<GetReviewCouncilResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Fetched Progress Review Councils successfully")
                .data(result)
                .build();
    }



}
