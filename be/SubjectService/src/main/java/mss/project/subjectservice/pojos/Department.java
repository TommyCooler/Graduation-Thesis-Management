package mss.project.subjectservice.pojos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "departments")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long departmentID;

    @Column(unique = true, nullable = false, length = 50)
    private String departmentName;

    @Column(length = 100)
    private String description;

//    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    private List<Subject> subjects;
}
