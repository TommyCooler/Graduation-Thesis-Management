package mss.project.subjectservice.dtos.response.department;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class UpdateDepartmentResponse {
    private Long departmentID;
    private String departmentName;
    private String departmentDescription;
}
