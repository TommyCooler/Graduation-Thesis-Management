package mss.project.topicapprovalservice.pojos;

import org.springframework.boot.autoconfigure.kafka.KafkaProperties.Retry.Topic;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mss.project.topicapprovalservice.enums.TopicRole;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "account_topics")
public class AccountTopics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topics topics;

    @Column(name = "account_id")
    private Long accountId;

    @Column(name = "account_name")
    private String accountName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private TopicRole role;
}