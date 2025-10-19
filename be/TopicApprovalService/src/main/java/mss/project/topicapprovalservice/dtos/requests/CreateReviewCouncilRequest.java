package mss.project.topicapprovalservice.dtos.requests;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mss.project.topicapprovalservice.enums.Milestone;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewCouncilRequest {

    @NotBlank(message = "Tên hội đồng không được để trống")
    private String councilName;

    @NotNull(message = "Đề tài không được để trống")
    private Long topicID;

    @NotNull(message = "Mốc review không được để trống")
    private Milestone milestone;

    @NotNull(message = "Ngày review không được để trốngd")
    @Future(message = "Ngày review phải là một ngày trong tương lai")
    private LocalDateTime reviewDate;

//    @NotNull(message = "Member account IDs are required")
//    private List<Long> memberAccountIDs;

    @NotEmpty(message = "Phải chọn đủ thành viên hội đồng")
    @Size(min = 2, max = 2, message = "Hội đồng phải có đúng 2 thành viên")
    private List<Long> lecturerAccountIds;


}
