package mss.project.topicapprovalservice.controllers;


import mss.project.topicapprovalservice.dtos.requests.CouncilCreateRequest;
import mss.project.topicapprovalservice.dtos.responses.ApiResponse;
import mss.project.topicapprovalservice.dtos.responses.CouncilResponse;
import mss.project.topicapprovalservice.pojos.Council;
import mss.project.topicapprovalservice.services.CouncilService;
import mss.project.topicapprovalservice.services.ICouncilService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/councils")
public class CouncilController {

    @Autowired
    private ICouncilService councilService;

    @PostMapping("/create")
    public ApiResponse<CouncilResponse> createCouncil(@RequestBody CouncilCreateRequest councilCreateRequest) {
        CouncilResponse saved = councilService.addCouncil(councilCreateRequest);
        ApiResponse<CouncilResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Council Created");
        apiResponse.setData(saved);
        return apiResponse;
    }
}
