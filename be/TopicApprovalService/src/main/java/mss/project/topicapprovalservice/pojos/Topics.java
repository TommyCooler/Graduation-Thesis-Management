package mss.project.topicapprovalservice.pojos;

import jakarta.persistence.*;
import lombok.*;
import mss.project.topicapprovalservice.enums.TopicStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "topics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Topics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "submited_at")
    private LocalDateTime submitedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private TopicStatus status;

    @Column(name = "file_path_url")
    private String filePathUrl;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "approval_count")
    private Integer approvalCount = 0;

    @Column(name = "required_approvals")
    private Integer requiredApprovals = 2;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TopicApproval> approvals = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.approvalCount == null) {
            this.approvalCount = 0;
        }
        if (this.requiredApprovals == null) {
            this.requiredApprovals = 2;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}