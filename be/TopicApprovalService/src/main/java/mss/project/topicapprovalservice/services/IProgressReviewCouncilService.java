package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.CreateReviewCouncilRequest;
import mss.project.topicapprovalservice.dtos.requests.UpdateCouncilRequest;
import mss.project.topicapprovalservice.dtos.responses.*;

import java.util.List;

public interface IProgressReviewCouncilService {

    CreateReviewCouncilResponse createReviewCouncil(Long topicID, CreateReviewCouncilRequest request);
    List<GetReviewCouncilResponse> getAllReviewCouncil(Long topicID);
    List<GetAllLecturerResponse> getAllLecturer();
    List<GetReviewCouncilResponse> getAllReviewCouncilForCalendar(Long accountID);
    GetReviewCouncilResponse getReviewCouncil(Long councilID);
    UpdateCouncilResponse updateReviewCouncil(Long councilID, UpdateCouncilRequest request);
//    List<GetReviewCouncilResponse> getAllMyReviewCouncil(Long accountID);
}
