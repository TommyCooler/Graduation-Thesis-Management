package mss.project.topicapprovalservice.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Status {
    // Status về tiến trình của hội đồng: PLANNED, COMPLETED, CANCELLED
    PLANNED("Đã lập"),
    COMPLETED("Hoàn thành"),
    CANCELLED("Đã hủy"),
    PENDING("Đang chờ"),
    APPROVED("Đã duyệt"),
    IN_PROGRESS("Đang chấm"),
    RETAKING("Đang chấm lại"),

    // Status của mỗi giảng viên trong hội đồng review: NOT_DECIDED, ACCEPT, REJECT
    ACCEPT("Chấp nhận"),
    REJECT("Từ chối"),
    NOT_DECIDED("Chưa chấm"),

    // Status cuar kết quả
    PASSED("Đạt"),
    NOT_PASSED("Không đạt"),
    NOT_REVIEWED("Chưa có"),
    ;






    private String value;
}
