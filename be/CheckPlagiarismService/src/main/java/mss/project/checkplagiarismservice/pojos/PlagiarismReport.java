//package mss.project.checkplagiarismservice.pojos;
//
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//@Table(name = "plagiarism_report")
//@Data
//@AllArgsConstructor
//@NoArgsConstructor
//@Entity
//public class PlagiarismReport {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(name = "plagiarism_percent")
//    private Double plagiarismPercent;
//
//    @Column(name = "topic_id", unique = false)
//    private Long topicId;
//
//    public PlagiarismReport(Long topicId) {
//        this.topicId = topicId;
//    }
//}
