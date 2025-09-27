package mss.project.aiservice.pojos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "plagiarism_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlagiarismReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}
