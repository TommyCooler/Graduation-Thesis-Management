package mss.project.topicapprovalservice.services;

import jakarta.transaction.Transactional;
import mss.project.topicapprovalservice.dtos.requests.CouncilTopicNoteRequest;
import mss.project.topicapprovalservice.dtos.responses.CouncilTopicNoteResponse;
import mss.project.topicapprovalservice.exceptions.AppException;
import mss.project.topicapprovalservice.exceptions.ErrorCode;
import mss.project.topicapprovalservice.pojos.CouncilMember;
import mss.project.topicapprovalservice.pojos.CouncilTopicEvaluation;
import mss.project.topicapprovalservice.pojos.Topics;
import mss.project.topicapprovalservice.repositories.CouncilMemberRepository;
import mss.project.topicapprovalservice.repositories.CouncilTopicEvaluationRepository;
import mss.project.topicapprovalservice.repositories.TopicsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class CouncilTopicEvaluationService implements ICouncilTopicEvaluationService{

    @Autowired
    private TopicsRepository topicsRepository;

    @Autowired
    private CouncilMemberRepository councilMemberRepository;

    @Autowired
    private CouncilTopicEvaluationRepository evaluationRepository;


    @Override
    @Transactional
    public CouncilTopicNoteResponse upsertNote(CouncilTopicNoteRequest request) {
        Topics topic = topicsRepository.findById(request.getTopicId())
                .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));

        CouncilMember councilMember = councilMemberRepository.findById(request.getCouncilMemberId())
                .orElseThrow(() -> new AppException(ErrorCode.COUNCIL_MEMBER_NOT_FOUND));
        if(topic.getCouncil()==null || councilMember.getCouncil()==null ||
                !topic.getCouncil().getId().equals(councilMember.getCouncil().getId())) {
            throw new AppException(ErrorCode.COUNCIL_MEMBER_NOT_IN_TOPIC_COUNCIL);
        }

        CouncilTopicEvaluation evaluation = evaluationRepository
                .findByTopicIdAndCouncilMemberId(request.getTopicId(), request.getCouncilMemberId())
                .orElse(new CouncilTopicEvaluation());
        evaluation.setTopic(topic);
        evaluation.setCouncilMember(councilMember);
        evaluation.setNote(request.getNote());
        CouncilTopicEvaluation saved = evaluationRepository.save(evaluation);
         return CouncilTopicNoteResponse.builder()
                .id(saved.getId())
                .topicId(topic.getId())
                .councilMemberId(councilMember.getId())
                .councilMemberRole(councilMember.getRole() != null ? councilMember.getRole().name() : null)
                .councilId(councilMember.getCouncil() != null ? councilMember.getCouncil().getId() : null)
                .note(saved.getNote())
                .createdAt(saved.getCreatedAt() != null ? saved.getCreatedAt().toString() : null)
                .updatedAt(saved.getUpdatedAt() != null ? saved.getUpdatedAt().toString() : null)
                .build();
    }


    @Override
    public List<CouncilTopicNoteResponse> getNotesByTopic(Long topicId) {
        Topics topic = topicsRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));

        return evaluationRepository.findAllByTopic(topic).stream()
                .map(evaluation -> CouncilTopicNoteResponse.builder()
                        .id(evaluation.getId())
                        .topicId(topic.getId())
                        .councilMemberId(evaluation.getCouncilMember().getId())
                        .councilMemberRole(evaluation.getCouncilMember().getRole() != null ? evaluation.getCouncilMember().getRole().name() : null)
                        .councilId(evaluation.getCouncilMember().getCouncil() != null ? evaluation.getCouncilMember().getCouncil().getId() : null)
                        .note(evaluation.getNote())
                        .createdAt(evaluation.getCreatedAt() != null ? evaluation.getCreatedAt().toString() : null)
                        .updatedAt(evaluation.getUpdatedAt() != null ? evaluation.getUpdatedAt().toString() : null)
                        .build())
                .toList();
    }

    @Override
    public List<CouncilTopicNoteResponse> getNotesByMember(Long councilMemberId) {
        CouncilMember member = councilMemberRepository.findById(councilMemberId)
                .orElseThrow(() -> new AppException(ErrorCode.COUNCIL_MEMBER_NOT_FOUND));

        return evaluationRepository.findAllByCouncilMember(member).stream()
                .map(evaluation -> CouncilTopicNoteResponse.builder()
                        .id(evaluation.getId())
                        .topicId(evaluation.getTopic().getId())
                        .councilMemberId(member.getId())
                        .councilMemberRole(member.getRole() != null ? member.getRole().name() : null)
                        .councilId(member.getCouncil() != null ? member.getCouncil().getId() : null)
                        .note(evaluation.getNote())
                        .createdAt(evaluation.getCreatedAt() != null ? evaluation.getCreatedAt().toString() : null)
                        .updatedAt(evaluation.getUpdatedAt() != null ? evaluation.getUpdatedAt().toString() : null)
                        .build())
                .toList();
    }
}
