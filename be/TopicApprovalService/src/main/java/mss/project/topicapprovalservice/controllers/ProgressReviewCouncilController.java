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


    @GetMapping("/lecturers")
    public ApiResponse<List<GetAllLecturerResponse>> getAllLecturers() {
        List<GetAllLecturerResponse> result = progressReviewCouncilService.getAllLecturer();
        return ApiResponse.<List<GetAllLecturerResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Fetched all lecturers successfully")
                .data((result))
                .build();
    }



    @PutMapping("/{councilID}/status")
    public ApiResponse<Void> updateStatus(@PathVariable Long councilID, @AuthenticationPrincipal Jwt jwt) {
        Long accountID = null;
        if (jwt != null) {
            try {
                accountID = Long.parseLong(jwt.getSubject());
            } catch (NumberFormatException e) {
                System.err.println("Failed to parse accountId from JWT subject: " + jwt.getSubject());
            }
        }
        progressReviewCouncilService.updateCouncilStatus(councilID, accountID);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Update status successfully")
                .build();
    }

    @GetMapping
    public ApiResponse<List<GetAllReviewCouncilResponse>> getAllReviewCouncilsForCalendar() {
        List<GetAllReviewCouncilResponse> result = progressReviewCouncilService.getAllReviewCouncilForCalendar();
        return ApiResponse.<List<GetAllReviewCouncilResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Fetched all Progress Review Councils successfully")
                .data(result)
                .build();
    }



}
