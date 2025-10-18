package mss.project.subjectservice.controllers;

import jakarta.validation.Valid;
import mss.project.subjectservice.dtos.request.department.CreateDepartmentRequest;
import mss.project.subjectservice.dtos.request.department.UpdateDepartmentRequest;
import mss.project.subjectservice.dtos.response.ApiResponse;
import mss.project.subjectservice.dtos.response.department.CreateDepartmentResponse;
import mss.project.subjectservice.dtos.response.department.GetADepartmentResponse;
import mss.project.subjectservice.dtos.response.department.GetAllDepartmentResponse;
import mss.project.subjectservice.dtos.response.department.UpdateDepartmentResponse;
import mss.project.subjectservice.services.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")

public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @PostMapping
    public ApiResponse<CreateDepartmentResponse> createDepartment(@Valid @RequestBody CreateDepartmentRequest request) {
        CreateDepartmentResponse result = departmentService.createDepartment(request);
        return ApiResponse.<CreateDepartmentResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Department created successfully")
                .result(result)
                .build();

    }

    @GetMapping
    public ApiResponse<List<GetAllDepartmentResponse>> getAllDepartments() {
        List<GetAllDepartmentResponse> result = departmentService.getAllDepartment();
        return ApiResponse.<List<GetAllDepartmentResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Departments retrieved successfully")
                .result(result)
                .build();
    }

    @GetMapping("/{departmentID}")
    public ApiResponse<GetADepartmentResponse> getDepartmentByID(@PathVariable Long departmentID) {
        GetADepartmentResponse result = departmentService.getADepartment(departmentID);
        return ApiResponse.<GetADepartmentResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Department retrieved successfully")
                .result(result)
                .build();
    }

    @PutMapping("/{departmentID}")
    public ApiResponse<UpdateDepartmentResponse> updateDepartment(@PathVariable Long departmentID, @RequestBody UpdateDepartmentRequest request) {
        UpdateDepartmentResponse result = departmentService.updateDepartment(departmentID, request);
        return ApiResponse.<UpdateDepartmentResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Department updated successfully")
                .result(result)
                .build();
    }

    @DeleteMapping("/{departmentID}")
    public ApiResponse<Void> deleteDepartment(@PathVariable Long departmentID) {
        departmentService.deleteDepartment(departmentID);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Department deleted successfully")
                .build();
    }



}
