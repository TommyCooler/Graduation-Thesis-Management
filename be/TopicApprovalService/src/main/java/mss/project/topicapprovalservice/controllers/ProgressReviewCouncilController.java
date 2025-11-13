package mss.project.topicapprovalservice.controllers;

import jakarta.validation.Valid;
import mss.project.topicapprovalservice.dtos.requests.CreateReviewCouncilRequest;
import mss.project.topicapprovalservice.dtos.requests.UpdateCouncilRequest;
import mss.project.topicapprovalservice.dtos.responses.*;
import mss.project.topicapprovalservice.services.IProgressReviewCouncilService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress-review-councils")
public class ProgressReviewCouncilController {

    @Autowired
    private IProgressReviewCouncilService progressReviewCouncilService;

    @PreAuthorize("hasRole('HEADOFDEPARTMENT')")
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
    public ApiResponse<List<GetReviewCouncilResponse>> getAllReviewCouncilsForCalendar(@AuthenticationPrincipal Jwt jwt) {
        Long accountID = null;
        if (jwt != null) {
            try {
                accountID = Long.parseLong(jwt.getSubject());
            } catch (NumberFormatException e) {
                System.err.println("Failed to parse accountId from JWT subject: " + jwt.getSubject());
            }
        }
        List<GetReviewCouncilResponse> result = progressReviewCouncilService.getAllReviewCouncilForCalendar(accountID);
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

    @PreAuthorize("hasRole('HEADOFDEPARTMENT')")
    @PutMapping("/{councilID}")
    public ApiResponse<UpdateCouncilResponse> updateReviewCouncil(@PathVariable Long councilID, @Valid @RequestBody UpdateCouncilRequest request) {
        UpdateCouncilResponse result = progressReviewCouncilService.updateReviewCouncil(councilID,request);
        return ApiResponse.<UpdateCouncilResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Update Progress Review Councils successfully")
                .data(result)
                .build();
    }



}
