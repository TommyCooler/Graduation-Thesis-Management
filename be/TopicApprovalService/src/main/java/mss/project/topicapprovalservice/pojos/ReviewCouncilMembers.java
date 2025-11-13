package mss.project.topicapprovalservice.pojos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mss.project.topicapprovalservice.enums.Status;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewCouncilMembers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "councilID", nullable = false)
    private ProgressReviewCouncils progressReviewCouncil;

    @Column(nullable = false)
    private Long accountID;

    @Column(nullable=true, length=500)
    private String overallComments;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status decision;

    public ReviewCouncilMembers(ProgressReviewCouncils progressReviewCouncil, Long accountID, Status decision) {
        this.progressReviewCouncil = progressReviewCouncil;
        this.accountID = accountID;
        this.decision = decision;
    }

}
