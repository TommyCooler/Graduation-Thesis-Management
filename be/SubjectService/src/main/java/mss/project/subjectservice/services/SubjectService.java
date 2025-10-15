package mss.project.subjectservice.services;

import mss.project.subjectservice.dtos.request.subject.CreateSubjectRequest;
import mss.project.subjectservice.dtos.request.subject.UpdateSubjectRequest;
import mss.project.subjectservice.dtos.response.subject.CreateSubjectResponse;
import mss.project.subjectservice.dtos.response.subject.GetASubjectResponse;
import mss.project.subjectservice.dtos.response.subject.GetAllSubjectsResponse;
import mss.project.subjectservice.dtos.response.subject.UpdateSubjectResponse;

import java.util.List;

public interface SubjectService {
    CreateSubjectResponse createSubject(CreateSubjectRequest request);
    List<GetAllSubjectsResponse> getAllSubjects();
    GetASubjectResponse getASubject(Long subjectID);
    UpdateSubjectResponse updateSubject(Long subjectID, UpdateSubjectRequest request);
    void deleteSubject(Long subjectID);

}
