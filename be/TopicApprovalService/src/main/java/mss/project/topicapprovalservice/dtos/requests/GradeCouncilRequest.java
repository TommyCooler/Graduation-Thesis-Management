package mss.project.topicapprovalservice.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mss.project.topicapprovalservice.enums.Status;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GradeCouncilRequest {
    @NotBlank(message = "Nhận xét của giảng viên không được để trống")
    private String overallComments;

    @NotNull(message = "Quyết định của giảng viên không được để trống")
    private Status decison;
}
