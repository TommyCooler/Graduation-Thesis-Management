package mss.project.checkplagiarismservice.pojos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Table(name = "plagiarism_results")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class PlagiarismResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID của đề tài hiện tại (đang được kiểm tra đạo văn)
    @Column(name = "topic_id", nullable = false)
    private Long topicId;

    // ID của đề tài bị đạo văn (từ metadata.topic_id trong Qdrant)
    @Column(name = "plagiarized_topic_id", nullable = false)
    private Long plagiarizedTopicId;

    // Nội dung bị đạo văn (content từ payload)
    @Column(name = "plagiarized_content", columnDefinition = "TEXT")
    private String plagiarizedContent;

    // File URL của đề tài bị đạo văn (metadata.file_url)
    @Column(name = "plagiarized_file_url", nullable = false)
    private String plagiarizedFileUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
