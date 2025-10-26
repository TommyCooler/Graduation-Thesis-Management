package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.CreateReviewCouncilRequest;
import mss.project.topicapprovalservice.dtos.responses.*;

import java.util.List;

public interface IProgressReviewCouncilService {

    CreateReviewCouncilResponse createReviewCouncil(CreateReviewCouncilRequest request);
    List<GetAllReviewCouncilResponse> getAllReviewCouncil();
    List<GetMemberOfReviewCouncilResponse> getMembersOfCouncil(Long councilId);
    List<GetAllLecturerResponse> getAllLecturer();
}
