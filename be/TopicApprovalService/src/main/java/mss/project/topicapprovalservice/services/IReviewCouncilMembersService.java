package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.GradeCouncilRequest;
import mss.project.topicapprovalservice.dtos.responses.GetMemberOfReviewCouncilResponse;
import mss.project.topicapprovalservice.dtos.responses.GradeCouncilResponse;

import java.util.List;

public interface IReviewCouncilMembersService {
    List<GetMemberOfReviewCouncilResponse> getMembersOfCouncil(Long councilId);
    GradeCouncilResponse gradeCouncil(Long councilID, GradeCouncilRequest request, Long accountID);
}
