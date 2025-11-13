package mss.project.topicapprovalservice.pojos;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "topic_approvals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicApproval {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topics topic;
    
    @Column(name = "approver_email", nullable = false)
    private String approverEmail;
    
    @Column(name = "approver_name", nullable = false)
    private String approverName;
    
    @Column(name = "approved_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime approvedAt;
    
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "approved_first")
    private Boolean approvedFirst;
}
