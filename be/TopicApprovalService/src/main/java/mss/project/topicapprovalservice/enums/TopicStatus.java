package mss.project.topicapprovalservice.enums;

public enum TopicStatus {
    DRAFT("Nháp"),
    PENDING("Chờ duyệt"),
    APPROVED("Đã duyệt"),
    REJECTED("Từ chối"),
    UNDER_REVIEW("Đang xem xét"),
    REVISION_REQUIRED("Yêu cầu sửa đổi");

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
