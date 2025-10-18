package mss.project.topicapprovalservice.pojos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "topic_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopicHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topics topic;
    
    @Column(name = "changed_content", columnDefinition = "TEXT")
    private String changedContent;
    
    @Column(name = "updated_by", nullable = false)
    private String updatedBy;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "action_type", nullable = false)
    private String actionType; // CREATE, UPDATE, DELETE
    
    @PrePersist
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }
}