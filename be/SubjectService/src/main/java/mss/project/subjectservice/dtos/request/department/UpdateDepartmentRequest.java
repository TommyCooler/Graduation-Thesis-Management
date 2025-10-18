package mss.project.subjectservice.dtos.request.department;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateDepartmentRequest {
    private String departmentName;
    private String departmentDescription;
}
