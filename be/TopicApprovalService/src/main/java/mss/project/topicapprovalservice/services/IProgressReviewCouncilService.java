package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.CreateReviewCouncilRequest;
import mss.project.topicapprovalservice.dtos.requests.GiveCommentRequest;
import mss.project.topicapprovalservice.dtos.responses.*;

import java.util.List;

public interface IProgressReviewCouncilService {

    CreateReviewCouncilResponse createReviewCouncil(Long topicID, CreateReviewCouncilRequest request);
    List<GetAllReviewCouncilResponse> getAllReviewCouncil(Long topicID);
    List<GetAllLecturerResponse> getAllLecturer();
    void updateCouncilStatus(Long councilID, Long accountID);
}
