package mss.project.subjectservice.services.impl;

import mss.project.subjectservice.dtos.request.department.CreateDepartmentRequest;
import mss.project.subjectservice.dtos.request.department.UpdateDepartmentRequest;
import mss.project.subjectservice.dtos.response.department.CreateDepartmentResponse;
import mss.project.subjectservice.dtos.response.department.GetADepartmentResponse;
import mss.project.subjectservice.dtos.response.department.GetAllDepartmentResponse;
import mss.project.subjectservice.dtos.response.department.UpdateDepartmentResponse;
import mss.project.subjectservice.exceptions.AppException;
import mss.project.subjectservice.exceptions.ErrorCode;
import mss.project.subjectservice.pojos.Department;
import mss.project.subjectservice.repositories.DepartmentRepository;
import mss.project.subjectservice.services.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartmentServiceImpl implements DepartmentService {
    @Autowired
    private DepartmentRepository departmentRepository;


    @Override
    @Transactional
    public CreateDepartmentResponse createDepartment(CreateDepartmentRequest request) {
        if(departmentRepository.findByDepartmentName(request.getDepartmentName()).isPresent()){
            throw new AppException(ErrorCode.DEPARTMENT_NAME_ALREADY_EXISTS);
        }
        Department department = new Department();
        department.setDepartmentName(request.getDepartmentName());
        department.setDescription(request.getDescription());
        departmentRepository.save(department);
        return CreateDepartmentResponse.builder()
                .departmentID(department.getDepartmentID())
                .departmentName(department.getDepartmentName())
                .description(department.getDescription())
                .build();
    }

    @Override
    public List<GetAllDepartmentResponse> getAllDepartment() {
        List<Department> departmentList = departmentRepository.findAll();
        if(departmentList.isEmpty()){
            throw new AppException(ErrorCode.NO_DEPARTMENTS_FOUND);
        }
        return departmentList.stream().map(department -> GetAllDepartmentResponse.builder()
                .departmentID(department.getDepartmentID())
                .departmentName(department.getDepartmentName())
                .description(department.getDescription())
                .build()).toList();
    }

    @Override
    public GetADepartmentResponse getADepartment(Long departmentID) {
        if(departmentRepository.findByDepartmentID(departmentID).isEmpty()){
            throw new AppException(ErrorCode.NO_DEPARTMENTS_FOUND);
        }
        Department department = departmentRepository.findByDepartmentID(departmentID).get();
        return GetADepartmentResponse.builder()
                .departmentID(department.getDepartmentID())
                .departmentName(department.getDepartmentName())
                .description(department.getDescription())
                .build();
    }

    @Override
    @Transactional
    public UpdateDepartmentResponse updateDepartment(Long departmentID, UpdateDepartmentRequest request) {
        if(departmentRepository.findByDepartmentID(departmentID).isEmpty()){
            throw new AppException(ErrorCode.NO_DEPARTMENTS_FOUND);
        }
        Department department = departmentRepository.findByDepartmentID(departmentID).get();
        if(!request.getDepartmentName().trim().isEmpty() && !request.getDepartmentName().equals(department.getDepartmentName())){
            department.setDepartmentName(request.getDepartmentName());
        }
        if(!request.getDepartmentDescription().trim().isEmpty() && !request.getDepartmentDescription().equals(department.getDescription())){
            department.setDescription(request.getDepartmentDescription());
        }
        departmentRepository.save(department);
        return UpdateDepartmentResponse.builder()
                .departmentID(department.getDepartmentID())
                .departmentName(department.getDepartmentName())
                .departmentDescription(department.getDescription())
                .build();
        }

    @Override
    public void deleteDepartment(Long departmentID) {
        if(departmentRepository.findByDepartmentID(departmentID).isEmpty()){
            throw new AppException(ErrorCode.NO_DEPARTMENTS_FOUND);
        }
        departmentRepository.deleteByDepartmentID(departmentID);
    }


}
