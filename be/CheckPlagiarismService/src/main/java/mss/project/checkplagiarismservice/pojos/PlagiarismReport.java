package mss.project.checkplagiarismservice.pojos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "plagiarism_report")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class PlagiarismReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double similarity;

    @Column(name = "lecture_id")
    private Long lectureId;

    @Column(name = "topic_id")
    private Long topicId;

}
