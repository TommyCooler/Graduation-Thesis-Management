package mss.project.topicapprovalservice.pojos;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mss.project.topicapprovalservice.enums.Role;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "council_members")
public class CouncilMember {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name ="role")
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "council_id")
    @JsonBackReference
    private Council council;

    @Column(name ="account_id")
    private Long accountId;

}

