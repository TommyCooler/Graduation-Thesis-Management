package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.CouncilCreateRequest;
import mss.project.topicapprovalservice.dtos.responses.CouncilResponse;
import mss.project.topicapprovalservice.dtos.responses.CouncilSummaryResponse;
import mss.project.topicapprovalservice.pojos.Council;

import java.util.List;

public interface ICouncilService {

    public Council getCouncilById(int id);
    public List<CouncilResponse> getAllCouncils();
    public List<CouncilResponse> addCouncil(CouncilCreateRequest councilCreateRequest);
    public CouncilResponse updateCouncil(int id, CouncilCreateRequest councilCreateRequest);
    public void deleteCouncil(int id);
    CouncilResponse updateCouncilStatus(int id, String status);
    List<CouncilSummaryResponse> getCouncilResponseByAccountId(Long accountId);

}
