package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.GiveCommentRequest;
import mss.project.topicapprovalservice.dtos.responses.AccountDTO;
import mss.project.topicapprovalservice.dtos.responses.GetMemberOfReviewCouncilResponse;
import mss.project.topicapprovalservice.dtos.responses.GiveCommentResponse;
import mss.project.topicapprovalservice.enums.Status;
import mss.project.topicapprovalservice.exceptions.AppException;
import mss.project.topicapprovalservice.exceptions.ErrorCode;
import mss.project.topicapprovalservice.pojos.ProgressReviewCouncils;
import mss.project.topicapprovalservice.pojos.ReviewCouncilMembers;
import mss.project.topicapprovalservice.repositories.ProgressReviewCouncilRepository;
import mss.project.topicapprovalservice.repositories.ReviewCouncilMemberRepository;
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
        return memberAccounts.stream().map(account ->
                GetMemberOfReviewCouncilResponse.builder()
                        .accountID(account.getId())
                        .accountName(account.getName())
                        .overallComments(commentsMap.get(account.getId()))
                        .build()
        ).toList();
    }

    @Override
    @Transactional
    public GiveCommentResponse giveComment(Long councilID, GiveCommentRequest request, Long accountID) {
        ProgressReviewCouncils council = progressReviewCouncilRepository.findByCouncilID(councilID);
        if (council == null) {
            throw new AppException(ErrorCode.REVIEW_COUNCIL_NOT_FOUND);
        }
        ReviewCouncilMembers member = reviewCouncilMembersRepository.findByProgressReviewCouncilAndAccountID(council, accountID);
        if (member == null) {
            throw new AppException(ErrorCode.LECTURER_IS_NOT_MEMBER);
        }
        if(council.getStatus() == Status.APPROVED) {
            throw new AppException(ErrorCode.STATUS_OF_COUNCIL_IS_APPROVED);
        } else {
            if(request.getOverallComments() != null && !request.getOverallComments().trim().isEmpty()) {
                member.setOverallComments(request.getOverallComments());
                reviewCouncilMembersRepository.save(member);
            }
        }
        return GiveCommentResponse.builder()
                .accountID(accountID)
                .overallComments(member.getOverallComments())
                .build();
    }

}
