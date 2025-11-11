package mss.project.topicapprovalservice.pojos;

import jakarta.persistence.*;
import lombok.*;
import mss.project.topicapprovalservice.enums.Milestone;
import mss.project.topicapprovalservice.enums.ReviewFormat;
import mss.project.topicapprovalservice.enums.Status;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgressReviewCouncils {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long councilID;

    @Column(unique=true, nullable=false)
    private String councilName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="topicID", nullable=false)
    private Topics topic;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Milestone milestone;

    @Column(nullable=false)
    private LocalDateTime reviewDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Status result;

    @Column(nullable=false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private ReviewFormat reviewFormat;

    private String meetingLink;

    private String roomNumber;




}
