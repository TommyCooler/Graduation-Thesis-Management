package mss.project.subjectservice.services.impl;

import mss.project.subjectservice.dtos.request.subject.CreateSubjectRequest;
import mss.project.subjectservice.dtos.request.subject.UpdateSubjectRequest;
import mss.project.subjectservice.dtos.response.subject.CreateSubjectResponse;
import mss.project.subjectservice.dtos.response.subject.GetASubjectResponse;
import mss.project.subjectservice.dtos.response.subject.GetAllSubjectsResponse;
import mss.project.subjectservice.dtos.response.subject.UpdateSubjectResponse;
import mss.project.subjectservice.exceptions.AppException;
import mss.project.subjectservice.exceptions.ErrorCode;
import mss.project.subjectservice.pojos.Subject;
import mss.project.subjectservice.repositories.DepartmentRepository;
import mss.project.subjectservice.repositories.SubjectRepository;
import mss.project.subjectservice.services.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SubjectServiceImpl implements SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private DepartmentRepository departmentRepository;


    @Override
    @Transactional
    public CreateSubjectResponse createSubject(CreateSubjectRequest request) {
        if(subjectRepository.findBySubjectName(request.getSubjectName()).isPresent()){
            throw new AppException(ErrorCode.SUBJECT_NAME_ALREADY_EXISTS);
        }
        if(subjectRepository.findBySubjectCode(request.getSubjectCode()).isPresent()){
            throw new AppException(ErrorCode.SUBJECT_CODE_ALREADY_EXISTS);
        }
        Subject subject = new Subject();
        subject.setSubjectName(request.getSubjectName());
        subject.setSubjectCode(request.getSubjectCode());
        subject.setDescription(request.getDescription());
        subject.setCredits(request.getCredits());
        subject.setPrerequisites(request.getPrerequisites());
        subject.setDepartment(departmentRepository.findByDepartmentID(request.getDepartmentID()).get());
        subjectRepository.save(subject);
        return CreateSubjectResponse.builder()
                .subjectID(subject.getSubjectID())
                .subjectName(subject.getSubjectName())
                .subjectCode(subject.getSubjectCode())
                .description(subject.getDescription())
                .credits(subject.getCredits())
                .prerequisites(subject.getPrerequisites())
                .departmentName(subject.getDepartment().getDepartmentName())
                .build();
    }

    @Override
    public List<GetAllSubjectsResponse> getAllSubjects() {
        List<Subject> subjectsList = subjectRepository.findAll();
        if(subjectsList.isEmpty()){
            throw new AppException(ErrorCode.NO_SUBJECTS_FOUND);
        }
        return subjectsList.stream()
                .map(subject -> GetAllSubjectsResponse.builder()
                        .subjectID(subject.getSubjectID())
                        .subjectName(subject.getSubjectName())
                        .subjectCode(subject.getSubjectCode())
                        .description(subject.getDescription())
                        .credits(subject.getCredits())
                        .prerequisites(subject.getPrerequisites())
                        .departmentName(subject.getDepartment().getDepartmentName())
                        .build()
                ).toList();
    }


    @Override
    public GetASubjectResponse getASubject(Long subjectID) {
        Optional<Subject> optionalSubject = subjectRepository.findBySubjectID(subjectID);
        if(optionalSubject.isEmpty()){
            throw new AppException(ErrorCode.NO_SUBJECTS_FOUND);
        }
        Subject subject = optionalSubject.get();
        return GetASubjectResponse.builder()
                .subjectID(subject.getSubjectID())
                .subjectName(subject.getSubjectName())
                .subjectCode(subject.getSubjectCode())
                .description(subject.getDescription())
                .credits(subject.getCredits())
                .prerequisites(subject.getPrerequisites())
                .departmentName(subject.getDepartment().getDepartmentName())
                .build();
    }

    @Override
    @Transactional
    public UpdateSubjectResponse updateSubject(Long subjectID, UpdateSubjectRequest request) {
        if(subjectRepository.findBySubjectID(subjectID).isEmpty()){
            throw new AppException(ErrorCode.NO_SUBJECTS_FOUND);
        }
        Subject subject = subjectRepository.findBySubjectID(subjectID).get();
        if(!request.getSubjectName().trim().isEmpty() && !request.getSubjectName().equals(subject.getSubjectName()) ){
            subject.setSubjectName(request.getSubjectName());
        }
        if(!request.getSubjectCode().trim().isEmpty() && !request.getSubjectCode().equals(subject.getSubjectCode()) ){
            subject.setSubjectCode(request.getSubjectCode());
        }
        if(!request.getDescription().trim().isEmpty() && !request.getDescription().equals(subject.getDescription()) ) {
            subject.setDescription(request.getDescription());
        }
        if(request.getCredits() >= 0 && request.getCredits() != subject.getCredits() ) {
            subject.setCredits(request.getCredits());
        }
        if(!request.getPrerequisites().trim().isEmpty() && !request.getPrerequisites().equals(subject.getPrerequisites()) ) {
            subject.setPrerequisites(request.getPrerequisites());
        }
        if(request.getDepartmentID() != null && !request.getDepartmentID().equals(subject.getDepartment().getDepartmentID()) ) {
            subject.setDepartment(departmentRepository.findByDepartmentID(request.getDepartmentID()).get());
        }
        subjectRepository.save(subject);
        return UpdateSubjectResponse.builder()
                .subjectID(subject.getSubjectID())
                .subjectName(subject.getSubjectName())
                .subjectCode(subject.getSubjectCode())
                .description(subject.getDescription())
                .credits(subject.getCredits())
                .prerequisites(subject.getPrerequisites())
                .departmentName(subject.getDepartment().getDepartmentName())
                .build();
    }

    @Override
    @Transactional
    public void deleteSubject(Long subjectID) {
        if(subjectRepository.findBySubjectID(subjectID).isEmpty()){
            throw new AppException(ErrorCode.NO_SUBJECTS_FOUND);
        }
        subjectRepository.deleteBySubjectID(subjectID);
    }

}
