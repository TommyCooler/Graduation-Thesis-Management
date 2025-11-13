package mss.project.topicapprovalservice.dtos.responses;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TopicWithApprovalStatusResponse extends TopicsDTOResponse {
    private Integer approvalCount;
    private Integer requiredApprovals;
    private String approvalStatus; // "0/2", "1/2", "2/2"
    private Boolean hasUserApproved;
    private List<TopicApprovalDTOResponse> approvals;

    @Builder(builderMethodName = "topicWithApprovalBuilder")
    public TopicWithApprovalStatusResponse(
            Long id,
            String title,
            String description,
            String submitedAt,
            String status,
            String filePathUrl,
            String createdBy,
            String createdAt,
            String updatedAt,
            Integer approvalCount,
            Integer requiredApprovals,
            String approvalStatus,
            Boolean hasUserApproved,
            List<TopicApprovalDTOResponse> approvals
    ) {
        // Set parent class fields
        this.setId(id);
        this.setTitle(title);
        this.setDescription(description);
        this.setSubmitedAt(submitedAt);
        this.setStatus(status);
        this.setFilePathUrl(filePathUrl);
        this.setCreatedBy(createdBy);
        this.setCreatedAt(createdAt);
        this.setUpdatedAt(updatedAt);

        // Set this class fields
        this.approvalCount = approvalCount;
        this.requiredApprovals = requiredApprovals;
        this.approvalStatus = approvalStatus;
        this.hasUserApproved = hasUserApproved;
        this.approvals = approvals;
    }
}
