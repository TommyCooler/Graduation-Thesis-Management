package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.CreateReviewCouncilRequest;
import mss.project.topicapprovalservice.dtos.responses.AccountDTO;
import mss.project.topicapprovalservice.dtos.responses.CreateReviewCouncilResponse;
import mss.project.topicapprovalservice.dtos.responses.GetAllReviewCouncilResponse;
import mss.project.topicapprovalservice.enums.Status;
import mss.project.topicapprovalservice.exceptions.AppException;
import mss.project.topicapprovalservice.exceptions.ErrorCode;
import mss.project.topicapprovalservice.pojos.ProgressReviewCouncils;
import mss.project.topicapprovalservice.pojos.ReviewCouncilMembers;
import mss.project.topicapprovalservice.pojos.Topics;
import mss.project.topicapprovalservice.repositories.AccountTopicsRepository;
import mss.project.topicapprovalservice.repositories.ProgressReviewCouncilRepository;
import mss.project.topicapprovalservice.repositories.ReviewCouncilMemberRepository;
import mss.project.topicapprovalservice.repositories.TopicsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Service
public class ProgressReviewCouncilServiceImpl implements IProgressReviewCouncilService{

    @Autowired
    private TopicsRepository topicsRepository;

    @Autowired
    private ProgressReviewCouncilRepository progressReviewCouncilRepository;

    @Autowired
    private ReviewCouncilMemberRepository reviewCouncilMembersRepository;

    @Autowired
    private AccountTopicsRepository accountTopicsRepository;

    @Autowired
    private AccountService accountService;

    @Override
    @Transactional
    public CreateReviewCouncilResponse createReviewCouncil(CreateReviewCouncilRequest request) {
        Optional<Topics> topicOpt = topicsRepository.findById(request.getTopicID());
        if(topicOpt.isEmpty()){
            throw new AppException(ErrorCode.TOPICS_NOT_FOUND);
        }
        List<Long> memberIDs = request.getLecturerAccountIds();
        switch (request.getMilestone()) {
            case WEEK_4:
                validateForWeek4(topicOpt.get(), memberIDs);
                break;
            case WEEK_8, WEEK_12:
                validateForWeek8AndWeek12(topicOpt.get(), memberIDs);
                break;
            default:
                throw new AppException(ErrorCode.MILESTONE_NOT_VALID);
        }

        ProgressReviewCouncils council = new ProgressReviewCouncils();
        council.setCouncilName(request.getCouncilName());
        council.setTopic(topicOpt.get());
        council.setMilestone(request.getMilestone());
        council.setReviewDate(request.getReviewDate());
        council.setStatus(Status.PLANNED);
        council.setCreatedAt(LocalDateTime.now());
        progressReviewCouncilRepository.save(council);

        memberIDs.forEach(accountId -> {
            ReviewCouncilMembers member = new ReviewCouncilMembers(council, accountId);
            reviewCouncilMembersRepository.save(member);
        });


        return CreateReviewCouncilResponse.builder()
                .councilID(council.getCouncilID())
                .councilName(council.getCouncilName())
                .milestone(council.getMilestone())
                .reviewDate(council.getReviewDate())
                .status(council.getStatus().getValue())
                .topicID(council.getTopic().getId())
                .createdAt(council.getCreatedAt())
                .lecturerAccountIds(memberIDs)
                .build();
    }

    @Override
    public List<GetAllReviewCouncilResponse> getAllReviewCouncil() {
        List<ProgressReviewCouncils> councilsList = progressReviewCouncilRepository.findAll();
        return councilsList.stream().map(council ->
                 GetAllReviewCouncilResponse.builder()
                    .councilID(council.getCouncilID())
                    .councilName(council.getCouncilName())
                    .topicID(council.getTopic().getId())
                    .milestone(council.getMilestone())
                    .reviewDate(council.getReviewDate())
                    .status(council.getStatus().getValue())
                    .createdAt(council.getCreatedAt())
                    .overallComment(council.getOverallComments())
                    .build()
        ).toList();
    }

    @Override
    public List<AccountDTO> getMembersOfCouncil(Long councilId) {
        ProgressReviewCouncils council = progressReviewCouncilRepository.findByCouncilID(councilId);
        if(council == null) {
           throw new AppException(ErrorCode.REVIEW_COUNCIL_NOT_FOUND);
        }

        return List.of();
    }

    private void validateForWeek4(Topics topic, List<Long> memberIDs) {
        Long supervisorID = accountTopicsRepository.findAccountIdByTopics(topic.getId());
        if (memberIDs.contains(supervisorID)) {
            throw new AppException(ErrorCode.MEMBER_CANNOT_BE_SUPERVISOR);
        }
    }

    private void validateForWeek8AndWeek12(Topics topic, List<Long> memberIDs) {
        List<Long> oldCouncilOfTopic = progressReviewCouncilRepository.findAllCouncilIDByTopic(topic.getId());
        int size = oldCouncilOfTopic.size();
        int count = 0;
        if (size < 1) {
            throw new AppException(ErrorCode.PREVIOUS_REVIEW_COUNCIL_NOT_FOUND);
        }
        List<Long> oldCouncilMembers = reviewCouncilMembersRepository.findAllByProgressReviewCouncil(oldCouncilOfTopic);
        for(int i = 0; i < size; i++) {
            Long oldLecturerID = oldCouncilMembers.get(i);
            if (memberIDs.contains(oldLecturerID)) {
                count++;
            }
        }
        if(count == 2 || count < 1) {
            throw new AppException(ErrorCode.MEMBER_NOT_VALID);
        }
        Long supervisorID = accountTopicsRepository.findAccountIdByTopics(topic.getId());
        if (memberIDs.contains(supervisorID)) {
            throw new AppException(ErrorCode.MEMBER_CANNOT_BE_SUPERVISOR);
        }
    }
}
