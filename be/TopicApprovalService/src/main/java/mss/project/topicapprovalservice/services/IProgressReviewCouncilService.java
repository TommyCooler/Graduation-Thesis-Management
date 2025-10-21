package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.CreateReviewCouncilRequest;
import mss.project.topicapprovalservice.dtos.responses.AccountDTO;
import mss.project.topicapprovalservice.dtos.responses.CreateReviewCouncilResponse;
import mss.project.topicapprovalservice.dtos.responses.GetAllReviewCouncilResponse;
import mss.project.topicapprovalservice.dtos.responses.GetMemberOfReviewCouncilResponse;

import java.util.List;

public interface IProgressReviewCouncilService {

    CreateReviewCouncilResponse createReviewCouncil(CreateReviewCouncilRequest request);
    List<GetAllReviewCouncilResponse> getAllReviewCouncil();
    List<GetMemberOfReviewCouncilResponse> getMembersOfCouncil(Long councilId);
}
