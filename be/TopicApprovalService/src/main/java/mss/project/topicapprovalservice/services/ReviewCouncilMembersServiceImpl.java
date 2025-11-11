package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.GradeCouncilRequest;
import mss.project.topicapprovalservice.dtos.responses.AccountDTO;
import mss.project.topicapprovalservice.dtos.responses.GetMemberOfReviewCouncilResponse;
import mss.project.topicapprovalservice.dtos.responses.GradeCouncilResponse;
import mss.project.topicapprovalservice.enums.Milestone;
import mss.project.topicapprovalservice.enums.Status;
import mss.project.topicapprovalservice.enums.TopicStatus;
import mss.project.topicapprovalservice.exceptions.AppException;
import mss.project.topicapprovalservice.exceptions.ErrorCode;
import mss.project.topicapprovalservice.pojos.ProgressReviewCouncils;
import mss.project.topicapprovalservice.pojos.ReviewCouncilMembers;
import mss.project.topicapprovalservice.repositories.ProgressReviewCouncilRepository;
import mss.project.topicapprovalservice.repositories.ReviewCouncilMemberRepository;
import mss.project.topicapprovalservice.repositories.TopicsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReviewCouncilMembersServiceImpl implements IReviewCouncilMembersService{

    @Autowired
    private ProgressReviewCouncilRepository progressReviewCouncilRepository;

    @Autowired
    private ReviewCouncilMemberRepository reviewCouncilMembersRepository;

    @Autowired
    private AccountService accountService;

    @Autowired
    private TopicsRepository topicsRepository;

    @Override
    public List<GetMemberOfReviewCouncilResponse> getMembersOfCouncil(Long councilId) {
        ProgressReviewCouncils council = progressReviewCouncilRepository.findByCouncilID(councilId);
        if (council == null) {
            throw new AppException(ErrorCode.REVIEW_COUNCIL_NOT_FOUND);
        }
        List<ReviewCouncilMembers> members = reviewCouncilMembersRepository.findAllByProgressReviewCouncil(council);
        if (members.isEmpty()) {
            throw new AppException(ErrorCode.REVIEW_COUNCIL_MEMBERS_NOT_FOUND);
        }
        List<Long> memberAccountIDs = new ArrayList<>();
        members.forEach(member -> {
            memberAccountIDs.add(member.getAccountID());
        });
        List<AccountDTO> memberAccounts = new ArrayList<>();
        memberAccountIDs.forEach(accountID -> {
            AccountDTO accountDTO = accountService.getAccountById(accountID);
            memberAccounts.add(accountDTO);
        });

        Map<Long, String> commentsMap = members.stream()
                .collect(Collectors.toMap(
                        ReviewCouncilMembers::getAccountID,
                        member -> member.getOverallComments() != null ? member.getOverallComments() : ""
                ));
        Map<Long, String> decisionMap = members.stream()
                .collect(Collectors.toMap(
                        ReviewCouncilMembers::getAccountID,
                        member -> member.getDecision() != null ? member.getDecision().getValue() : "Chưa chấm"
                ));
        return memberAccounts.stream().map(account ->
                GetMemberOfReviewCouncilResponse.builder()
                        .accountID(account.getId())
                        .accountName(account.getName())
                        .overallComments(commentsMap.get(account.getId()))
                        .email(account.getEmail())
                        .decision(decisionMap.get(account.getId()))
                        .build()
        ).toList();
    }

    @Override
    @Transactional
    public GradeCouncilResponse gradeCouncil(Long councilID, GradeCouncilRequest request, Long accountID) {
        ProgressReviewCouncils council = progressReviewCouncilRepository.findByCouncilID(councilID);
        if (council == null) {
            throw new AppException(ErrorCode.REVIEW_COUNCIL_NOT_FOUND);
        }
        ReviewCouncilMembers member = reviewCouncilMembersRepository.findByProgressReviewCouncilAndAccountID(council, accountID);
        if (member == null) {
            throw new AppException(ErrorCode.LECTURER_IS_NOT_MEMBER);
        }
        if(council.getStatus() != Status.PLANNED) {
            throw new AppException(ErrorCode.STATUS_OF_COUNCIL_IS_NOT_PLANNED);
        }
        member.setOverallComments(request.getOverallComments());
        member.setDecision(request.getDecision());
        reviewCouncilMembersRepository.save(member);

        if(reviewCouncilMembersRepository.findAllByProgressReviewCouncilAndDecision(council, Status.ACCEPT).size() == 2) {
            council.setStatus(Status.COMPLETED);
            council.setResult(Status.PASSED);
            setStatusForTopicByMilestone(council);
        }
        if (!reviewCouncilMembersRepository.findAllByProgressReviewCouncilAndDecision(council, Status.REJECT).isEmpty()) {
            council.setStatus(Status.COMPLETED);
            council.setResult(Status.NOT_PASSED);
            council.getTopic().setStatus(TopicStatus.FAILED);
        }
        progressReviewCouncilRepository.save(council);
        topicsRepository.save(council.getTopic());
        return GradeCouncilResponse.builder()
                .accountID(accountID)
                .overallComments(member.getOverallComments())
                .decision(member.getDecision().getValue())
                .build();
    }

    private void setStatusForTopicByMilestone(ProgressReviewCouncils council) {
        if(council.getMilestone() == Milestone.WEEK_4) {
            council.getTopic().setStatus(TopicStatus.PASSED_REVIEW_1);
        } else if (council.getMilestone() == Milestone.WEEK_8) {
            council.getTopic().setStatus(TopicStatus.PASSED_REVIEW_2);
        } else {
            council.getTopic().setStatus(TopicStatus.PASSED_REVIEW_3);
        }
    }
}


