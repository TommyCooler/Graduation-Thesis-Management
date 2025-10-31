package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.GiveCommentRequest;
import mss.project.topicapprovalservice.dtos.responses.GetMemberOfReviewCouncilResponse;
import mss.project.topicapprovalservice.dtos.responses.GiveCommentResponse;

import java.util.List;

public interface IReviewCouncilMembersService {
    List<GetMemberOfReviewCouncilResponse> getMembersOfCouncil(Long councilId);
    GiveCommentResponse giveComment(Long councilID, GiveCommentRequest request, Long accountID);
}
