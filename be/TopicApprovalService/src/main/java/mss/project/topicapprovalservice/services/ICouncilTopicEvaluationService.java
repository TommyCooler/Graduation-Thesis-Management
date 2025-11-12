package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.CouncilTopicNoteRequest;
import mss.project.topicapprovalservice.dtos.responses.CouncilTopicNoteResponse;

import java.util.List;

public interface ICouncilTopicEvaluationService {
    CouncilTopicNoteResponse upsertNote(CouncilTopicNoteRequest request);
    List<CouncilTopicNoteResponse> getNotesByTopic(Long topicId);
    List<CouncilTopicNoteResponse> getNotesByMember(Long councilMemberId);
}
