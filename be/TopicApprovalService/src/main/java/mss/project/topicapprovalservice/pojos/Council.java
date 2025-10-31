package mss.project.topicapprovalservice.pojos;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mss.project.topicapprovalservice.enums.Status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "councils")
public class Council {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "council_name")
    private String councilName;

    @Column(name ="defense_date")
    private LocalDate defenseDate;

    @Column(name= "semester")
    private String semester;

    @Column(name = "status")
    private Status status;

    @OneToMany(mappedBy = "council", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<CouncilMember> councilMembers= new ArrayList<>();;

    @OneToMany(mappedBy = "council", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Topics> topics = new ArrayList<>();
}
