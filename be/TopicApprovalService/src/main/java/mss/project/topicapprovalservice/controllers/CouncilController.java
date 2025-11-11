package mss.project.topicapprovalservice.controllers;


import mss.project.topicapprovalservice.dtos.requests.CouncilCreateRequest;
import mss.project.topicapprovalservice.dtos.responses.ApiResponse;
import mss.project.topicapprovalservice.dtos.responses.CouncilResponse;
import mss.project.topicapprovalservice.dtos.responses.CouncilSummaryResponse;
import mss.project.topicapprovalservice.exceptions.AppException;
import mss.project.topicapprovalservice.exceptions.ErrorCode;
import mss.project.topicapprovalservice.pojos.Council;
import mss.project.topicapprovalservice.services.CouncilService;
import mss.project.topicapprovalservice.services.ICouncilService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/councils")
public class CouncilController {

    @Autowired
    private ICouncilService councilService;

    @PreAuthorize("hasRole('HEADOFDEPARTMENT')")
    @PostMapping("/create")
    public ApiResponse<List<CouncilResponse>> createCouncil(@RequestBody CouncilCreateRequest councilCreateRequest) {
        List<CouncilResponse> saved = councilService.addCouncil(councilCreateRequest);
        return ApiResponse.<List<CouncilResponse>>builder()
                .code(201)
                .message("Council created successfully")
                .data(saved)
                .build();
    }

    @PreAuthorize("hasRole('HEADOFDEPARTMENT')")
    @GetMapping("/all")
    public ApiResponse<List<CouncilResponse>> findAllCouncil() {
        List<CouncilResponse> councils = councilService.getAllCouncils();
        if(councils.isEmpty()) {
            return ApiResponse.<List<CouncilResponse>>builder()
                    .code(404)
                    .message("No councils found")
                    .data(councils)
                    .build();
        }
        return ApiResponse.<List<CouncilResponse>>builder()
                .code(200)
                .message("Fetched all councils successfully")
                .data(councils)
                .build();
    }

    @PutMapping("/{councilId}/status")
    public ApiResponse<CouncilResponse> updateCouncilStatus(@PathVariable int councilId, @RequestParam String status) {
        CouncilResponse councilResponse =councilService.updateCouncilStatus(councilId, status);
        return ApiResponse.<CouncilResponse>builder()
                .code(200)
                .message("Council status updated successfully")
                .data(councilResponse)
                .build();
    }

    @GetMapping("/my-councils")
    public ApiResponse<List<CouncilSummaryResponse>> getCouncilsByAccountId(@AuthenticationPrincipal Jwt jwt) {

        if (jwt == null || jwt.getSubject() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        Long accountId;
        try {
            accountId = Long.parseLong(jwt.getSubject());
        } catch (NumberFormatException e) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        List<CouncilSummaryResponse> councils = councilService.getCouncilResponseByAccountId(accountId);
        return ApiResponse.<List<CouncilSummaryResponse>>builder()
                .code(200)
                .message("Fetched councils for account successfully")
                .data(councils)
                .build();
    }

    @PutMapping("/{councilId}/update-retake-date")
    public ApiResponse<CouncilResponse> updateRetakeDate(@PathVariable Long councilId) {
        councilService.updateRetakeDateForFailedTopic(councilId);
        CouncilResponse council = councilService.updateCouncilStatus((int) councilId.longValue(), ""); // Hoặc tạo method getCouncilResponseById
        return ApiResponse.<CouncilResponse>builder()
                .code(200)
                .message("Đã cập nhật ngày chấm lại cho hội đồng")
                .data(council)
                .build();
    }
}
