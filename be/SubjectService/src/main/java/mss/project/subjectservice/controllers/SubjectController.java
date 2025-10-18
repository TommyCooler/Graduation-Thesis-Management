package mss.project.subjectservice.controllers;

import jakarta.validation.Valid;
import mss.project.subjectservice.dtos.request.subject.CreateSubjectRequest;
import mss.project.subjectservice.dtos.request.subject.UpdateSubjectRequest;
import mss.project.subjectservice.dtos.response.ApiResponse;
import mss.project.subjectservice.dtos.response.subject.CreateSubjectResponse;
import mss.project.subjectservice.dtos.response.subject.GetASubjectResponse;
import mss.project.subjectservice.dtos.response.subject.GetAllSubjectsResponse;
import mss.project.subjectservice.dtos.response.subject.UpdateSubjectResponse;
import mss.project.subjectservice.services.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @PostMapping
    public ApiResponse<CreateSubjectResponse> createSubject(@Valid @RequestBody CreateSubjectRequest request) {
        CreateSubjectResponse result = subjectService.createSubject(request);
        return ApiResponse.<CreateSubjectResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Subject created successfully")
                .result(result)
                .build();
    }

    @GetMapping
    public ApiResponse<List<GetAllSubjectsResponse>> getAllSubjects() {
        List<GetAllSubjectsResponse> result = subjectService.getAllSubjects();
        return ApiResponse.<List<GetAllSubjectsResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("All subjects retrieved successfully")
                .result(result)
                .build();
    }

   @GetMapping("/{subjectID}")
    public ApiResponse<GetASubjectResponse> getSubjectByID(@PathVariable Long subjectID) {
        GetASubjectResponse result = subjectService.getASubject(subjectID);
        return ApiResponse.<GetASubjectResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Subject retrieved successfully")
                .result(result)
                .build();
    }

    @PutMapping("/{subjectID}")
    public ApiResponse<UpdateSubjectResponse> updateSubject(@PathVariable Long subjectID, @RequestBody UpdateSubjectRequest request) {
        UpdateSubjectResponse result = subjectService.updateSubject(subjectID, request);
        return ApiResponse.<UpdateSubjectResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Subject updated successfully")
                .result(result)
                .build();
    }

    @DeleteMapping("/{subjectID}")
    public ApiResponse<Void> deleteSubject(@PathVariable Long subjectID) {
        subjectService.deleteSubject(subjectID);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Subject deleted successfully")
                .build();
    }


}
