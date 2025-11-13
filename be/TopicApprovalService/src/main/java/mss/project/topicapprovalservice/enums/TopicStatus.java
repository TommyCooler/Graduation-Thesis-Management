package mss.project.topicapprovalservice.enums;

public enum TopicStatus {
    DRAFT("Nháp"),
    PENDING("Chờ duyệt"),
    APPROVED("Đã duyệt"),
    REJECTED("Từ chối"),
    UNDER_REVIEW("Đang xem xét"),
    REVISION_REQUIRED("Yêu cầu sửa đổi"),

    // Status cho topic qua các mốc review
    PASSED_REVIEW_1("Đạt lần 1"),
    PASSED_REVIEW_2("Đạt lần 2"),
    PASSED_REVIEW_3("Đạt lần 3"),
    FAILED("Không đạt"),


    ASSIGNED_TO_COUNCIL("Đã gán vào hội đồng"),
    GRADUATED("Đã tốt nghiệp"),
    FAILED_GRADUATION("Rớt tốt nghiệp"),
    RETAKING("Đang chấm lại"),
    ;
    private final String displayName;

    TopicStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static TopicStatus fromString(String status) {
        if (status == null || status.isEmpty()) {
            return PENDING;
        }
        try {
            return TopicStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return PENDING;
        }
    }
}
