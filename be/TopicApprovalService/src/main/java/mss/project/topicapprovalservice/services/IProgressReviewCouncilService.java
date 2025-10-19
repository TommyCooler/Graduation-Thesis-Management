package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.CreateReviewCouncilRequest;
import mss.project.topicapprovalservice.dtos.responses.AccountDTO;
import mss.project.topicapprovalservice.dtos.responses.CreateReviewCouncilResponse;
import mss.project.topicapprovalservice.dtos.responses.GetAllReviewCouncilResponse;

import java.util.List;

public interface IProgressReviewCouncilService {

    CreateReviewCouncilResponse createReviewCouncil(CreateReviewCouncilRequest request);
    List<GetAllReviewCouncilResponse> getAllReviewCouncil();
    List<AccountDTO> getMembersOfCouncil(Long councilId);
}
