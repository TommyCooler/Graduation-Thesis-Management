package mss.project.topicapprovalservice.controllers;

import jakarta.validation.Valid;
import mss.project.topicapprovalservice.dtos.requests.GradeCouncilRequest;
import mss.project.topicapprovalservice.dtos.responses.ApiResponse;
import mss.project.topicapprovalservice.dtos.responses.GetMemberOfReviewCouncilResponse;
import mss.project.topicapprovalservice.dtos.responses.GradeCouncilResponse;
import mss.project.topicapprovalservice.services.IReviewCouncilMembersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review-council-members")
public class ReviewCouncilMembersController {

    @Autowired
    private IReviewCouncilMembersService reviewCouncilMembersService;


    @GetMapping("/{councilId}" )
    public ApiResponse<List<GetMemberOfReviewCouncilResponse>> getMembersOfReviewCouncil(@PathVariable Long councilId) {
        List<GetMemberOfReviewCouncilResponse> result = reviewCouncilMembersService.getMembersOfCouncil(councilId);
        return ApiResponse.<List<GetMemberOfReviewCouncilResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Fetched members of Progress Review Council successfully")
                .data(result)
                .build();
    }

    @PutMapping("/{councilID}/grade")
    public ApiResponse<GradeCouncilResponse> gradeCouncil(@Valid @RequestBody GradeCouncilRequest request, @PathVariable Long councilID, @AuthenticationPrincipal Jwt jwt) {
        Long accountID = null;
        if (jwt != null) {
            try {
                accountID = Long.parseLong(jwt.getSubject());
            } catch (NumberFormatException e) {
                System.err.println("Failed to parse accountId from JWT subject: " + jwt.getSubject());
            }
        }
        GradeCouncilResponse result = reviewCouncilMembersService.gradeCouncil(councilID, request, accountID);
        return ApiResponse.<GradeCouncilResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Graded successfully")
                .data(result)
                .build();
    }
}
