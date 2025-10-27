    package mss.project.topicapprovalservice.dtos.responses;
    
    import lombok.AllArgsConstructor;
    import lombok.Builder;
    import lombok.Data;
    import lombok.NoArgsConstructor;
    import mss.project.topicapprovalservice.enums.Milestone;
    import mss.project.topicapprovalservice.enums.Status;
    
    import java.time.LocalDateTime;
    import java.util.List;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public class GetAllReviewCouncilResponse {
    
        private Long councilID;
        private String councilName;
        private Long topicID;
        private String topicTitle;
        private Milestone milestone;
        private LocalDateTime reviewDate;
        private String status;
        private LocalDateTime createdAt;
//        private String overallComment;
    //    private List<Lecturer> lecturers;
    
    //    @Data
    //    @AllArgsConstructor
    //    @NoArgsConstructor
    //    @Builder
    //    public static class Lecturer {
    //        private Long lecturerID;
    //        private String lecturerName;
    //    }
    
    }
