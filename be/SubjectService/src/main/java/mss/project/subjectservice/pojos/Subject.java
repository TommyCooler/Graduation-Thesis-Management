package mss.project.subjectservice.pojos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subjects")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long subjectID;

    @Column(unique = true, nullable = false, length = 50)
    private String subjectName;

    @Column(unique = true, nullable = false, length = 10)
    private String subjectCode;

    @Column(length = 100)
    private String description;

    @Column(nullable = false)
    private int credits;

    @Column(length = 10)
    private String prerequisites;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;
}
