package mss.project.topicapprovalservice.controllers;


import mss.project.topicapprovalservice.dtos.requests.CouncilCreateRequest;
import mss.project.topicapprovalservice.dtos.responses.ApiResponse;
import mss.project.topicapprovalservice.dtos.responses.CouncilResponse;
import mss.project.topicapprovalservice.pojos.Council;
import mss.project.topicapprovalservice.services.CouncilService;
import mss.project.topicapprovalservice.services.ICouncilService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/councils")
public class CouncilController {

    @Autowired
    private ICouncilService councilService;

    @PostMapping("/create")
    public ApiResponse<CouncilResponse> createCouncil(@RequestBody CouncilCreateRequest councilCreateRequest) {
        CouncilResponse saved = councilService.addCouncil(councilCreateRequest);
        return ApiResponse.<CouncilResponse>builder()
                .code(201)
                .message("Council created successfully")
                .data(saved)
                .build();
    }

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
        councilService.updateCouncilStatus(councilId, status);
        return ApiResponse.<CouncilResponse>builder()
                .code(200)
                .message("Council status updated successfully")
                .build();
    }
}
