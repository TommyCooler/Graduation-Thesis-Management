package mss.project.subjectservice.dtos.request.department;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDepartmentRequest {
    @NotBlank(message = "Department name is required")
    @Size(min =3, max = 50, message = "Department name must be between 3 and 50 characters")
    private String departmentName;

    private String description;
}
