package mss.project.subjectservice.services;

import mss.project.subjectservice.dtos.request.department.CreateDepartmentRequest;
import mss.project.subjectservice.dtos.request.department.UpdateDepartmentRequest;
import mss.project.subjectservice.dtos.response.department.CreateDepartmentResponse;
import mss.project.subjectservice.dtos.response.department.GetADepartmentResponse;
import mss.project.subjectservice.dtos.response.department.GetAllDepartmentResponse;
import mss.project.subjectservice.dtos.response.department.UpdateDepartmentResponse;

import java.util.List;

public interface DepartmentService {
    CreateDepartmentResponse createDepartment(CreateDepartmentRequest createDepartmentRequest);
    List<GetAllDepartmentResponse> getAllDepartment();
    GetADepartmentResponse getADepartment(Long departmentID);
    UpdateDepartmentResponse updateDepartment(Long departmentID, UpdateDepartmentRequest updateDepartmentRequest);
    void deleteDepartment(Long departmentID);
}
