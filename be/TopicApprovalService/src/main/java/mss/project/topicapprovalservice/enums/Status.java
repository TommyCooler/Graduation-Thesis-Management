package mss.project.topicapprovalservice.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Status {
    PLANNED("Đã lập"),
    COMPLETED("Hoàn thành"),
    CANCELLED("Đã hủy");

    private String value;
}
