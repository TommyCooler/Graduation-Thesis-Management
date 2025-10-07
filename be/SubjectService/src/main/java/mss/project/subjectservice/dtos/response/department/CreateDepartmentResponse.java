package mss.project.subjectservice.dtos.response.department;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateDepartmentResponse {
    private Long departmentID;
    private String departmentName;
    private String description;
}
