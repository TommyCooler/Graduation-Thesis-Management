package mss.project.topicapprovalservice.dtos.requests;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mss.project.topicapprovalservice.enums.Milestone;
import mss.project.topicapprovalservice.enums.ReviewFormat;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewCouncilRequest {

    @NotNull(message = "Mốc review không được để trống")
    private Milestone milestone;

    @Future(message = "Ngày review phải là một ngày trong tương lai")
    private LocalDateTime reviewDate;

    @NotNull(message = "Hình thức review không được để trống")
    private ReviewFormat reviewFormat;

    @URL(message = "Link meeting không hợp lệ")
    private String meetingLink;

    private String roomNumber;

    @NotEmpty(message = "Phải chọn đủ thành viên hội đồng")
    @Size(min = 2, max = 2, message = "Hội đồng phải có đúng 2 thành viên")
    private List<Long> lecturerAccountIds;


}
