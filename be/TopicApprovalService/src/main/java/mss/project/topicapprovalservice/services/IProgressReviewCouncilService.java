package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.CreateReviewCouncilRequest;
import mss.project.topicapprovalservice.dtos.responses.*;

import java.util.List;

public interface IProgressReviewCouncilService {

    CreateReviewCouncilResponse createReviewCouncil(Long topicID, CreateReviewCouncilRequest request);
    List<GetReviewCouncilResponse> getAllReviewCouncil(Long topicID);
    List<GetAllLecturerResponse> getAllLecturer();
    List<GetReviewCouncilResponse> getAllReviewCouncilForCalendar();
    GetReviewCouncilResponse getReviewCouncil(Long councilID);
}
