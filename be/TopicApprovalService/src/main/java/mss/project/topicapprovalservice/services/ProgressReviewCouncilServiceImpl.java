package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.CreateReviewCouncilRequest;
import mss.project.topicapprovalservice.dtos.requests.GiveCommentRequest;
import mss.project.topicapprovalservice.dtos.responses.*;
import mss.project.topicapprovalservice.enums.Milestone;
import mss.project.topicapprovalservice.enums.ReviewFormat;
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
import java.time.format.DateTimeFormatter;


import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
public class ProgressReviewCouncilServiceImpl implements IProgressReviewCouncilService {

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
    public CreateReviewCouncilResponse createReviewCouncil(Long topicID, CreateReviewCouncilRequest request) {
        Optional<Topics> topicOpt = topicsRepository.findById(topicID);
        if (topicOpt.isEmpty()) {
            throw new AppException(ErrorCode.TOPICS_NOT_FOUND);
        }
        List<Long> memberIDs = request.getLecturerAccountIds();
        switch (request.getMilestone()) {
            case WEEK_4:
                validateForWeek4(topicOpt.get(), memberIDs, request);
                break;
            case WEEK_8, WEEK_12:
                validateForWeek8AndWeek12(topicOpt.get(), memberIDs, request);
                break;
            default:
                throw new AppException(ErrorCode.MILESTONE_NOT_VALID);
        }

        ProgressReviewCouncils council = new ProgressReviewCouncils();
//        if (progressReviewCouncilRepository.findByCouncilName(request.getCouncilName()) != null) {
//            throw new AppException(ErrorCode.NAME_OF_REVIEW_COUNCIL_ALREADY_EXIST);
//        }
        council.setCouncilName("Hội đồng review " + request.getMilestone() + " đề tài " + topicOpt.get().getTitle());
        council.setTopic(topicOpt.get());
        council.setMilestone(request.getMilestone());
        if (request.getMilestone().equals(Milestone.WEEK_4)) {
            council.setReviewDate(request.getReviewDate());
        } else {
            if (request.getMilestone().equals(Milestone.WEEK_8)) {
                council.setReviewDate(progressReviewCouncilRepository.findByTopicAndMilestone(topicOpt.get(), Milestone.WEEK_4).getReviewDate().plusDays(28));
            } else {
                council.setReviewDate(progressReviewCouncilRepository.findByTopicAndMilestone(topicOpt.get(), Milestone.WEEK_8).getReviewDate().plusDays(28));
            }
        }
//        council.setReviewDate(request.getReviewDate());
        council.setStatus(Status.PLANNED);
//        council.setOverallComments("");
        council.setCreatedAt(LocalDateTime.now());
        if (request.getReviewFormat() == ReviewFormat.ONLINE) {
            council.setReviewFormat(ReviewFormat.ONLINE);
            if (request.getMeetingLink() == null || request.getMeetingLink().trim().isEmpty()) {
                throw new AppException(ErrorCode.MEETING_LINK_IS_NOT_VALID);
            } else {
                council.setMeetingLink(request.getMeetingLink());
            }
        } else {
            council.setReviewFormat(ReviewFormat.OFFLINE);
            if (request.getRoomNumber() == null || request.getRoomNumber().trim().isEmpty()) {
                throw new AppException(ErrorCode.ROOM_NUMBER_IS_NOT_VALID);
            } else {
                council.setRoomNumber(request.getRoomNumber());
            }
        }
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
                .reviewFormat(council.getReviewFormat())
                .meetingLink(council.getMeetingLink())
                .roomNumber(council.getRoomNumber())
                .lecturerAccountIds(memberIDs)
                .build();
    }

    @Override
    public List<GetAllReviewCouncilResponse> getAllReviewCouncil(Long topicID) {
        Optional<Topics> topicOpt = topicsRepository.findById(topicID);
        if (topicOpt.isEmpty()) {
            throw new AppException(ErrorCode.TOPICS_NOT_FOUND);
        }
        List<ProgressReviewCouncils> councilsList = progressReviewCouncilRepository.findAllByTopic(topicOpt.get());
        return councilsList.stream().map(council ->
                        GetAllReviewCouncilResponse.builder()
                                .councilID(council.getCouncilID())
                                .councilName(council.getCouncilName())
                                .topicID(council.getTopic().getId())
                                .topicTitle(council.getTopic().getTitle())
                                .milestone(council.getMilestone())
                                .reviewDate(council.getReviewDate())
                                .status(council.getStatus().getValue())
                                .createdAt(council.getCreatedAt())
                                .reviewFormat(council.getReviewFormat())
                                .meetingLink(council.getMeetingLink())
                                .roomNumber(council.getRoomNumber())
                                .build()
        ).toList();
    }


    @Override
    public List<GetAllLecturerResponse> getAllLecturer() {
        List<AccountDTO> accountDTOList = accountService.getAllAccounts();
        List<AccountDTO> lecturerList = new ArrayList<>();
        accountDTOList.forEach(account -> {
            if (account.getRole().equals("LECTURER")) {
                lecturerList.add(account);
            }
        });
        return lecturerList.stream().map(lecturer ->
                GetAllLecturerResponse.builder()
                        .accountID(lecturer.getId())
                        .accountName(lecturer.getName())
                        .build()
        ).toList();
    }


    @Override
    @Transactional
    public void updateCouncilStatus(Long councilID, Long accountID) {
        ProgressReviewCouncils council = progressReviewCouncilRepository.findByCouncilID(councilID);
        if (council == null) {
            throw new AppException(ErrorCode.REVIEW_COUNCIL_NOT_FOUND);
        }
        ReviewCouncilMembers member = reviewCouncilMembersRepository.findByProgressReviewCouncilAndAccountID(council, accountID);
        if (member == null) {
            throw new AppException(ErrorCode.LECTURER_IS_NOT_MEMBER);
        }
        if(!reviewCouncilMembersRepository.findAllByProgressReviewCouncilAndOverallCommentsIsNull(council).isEmpty()) {
            throw new AppException(ErrorCode.COMMENT_IS_NULL);
        } else {
            council.setStatus(Status.APPROVED);
            progressReviewCouncilRepository.save(council);
        }
    }


    private void validateForWeek4(Topics topic, List<Long> memberIDs, CreateReviewCouncilRequest request) {
        Long supervisorID = accountTopicsRepository.findByTopics(topic).getAccountId();
        if (memberIDs.contains(supervisorID)) {
            throw new AppException(ErrorCode.MEMBER_CANNOT_BE_SUPERVISOR);
        }
//        if (request.getReviewDate() == null) {
//            throw new AppException(ErrorCode.REVIEW_DATE_FOR_WEEK_4_NOT_FOUND);
//        }
        List<ProgressReviewCouncils> oldCouncilOfTopic = progressReviewCouncilRepository.findAllByTopic(topic);
        int size = oldCouncilOfTopic.size();
        if (size > 0) {
            throw new AppException(ErrorCode.REVIEW_COUNIL_FOR_THIS_WEEK_ALREADY_EXIST);
        }
    }

    private void validateForWeek8AndWeek12(Topics topic, List<Long> memberIDs, CreateReviewCouncilRequest request) {
        List<ProgressReviewCouncils> oldCouncilOfTopic = progressReviewCouncilRepository.findAllByTopic(topic);
        int size = oldCouncilOfTopic.size();
        int count = 0;
        if (request.getMilestone() == Milestone.WEEK_8) {
            if (size < 1) {
                throw new AppException(ErrorCode.PREVIOUS_REVIEW_COUNCIL_NOT_FOUND);
            }
            if (progressReviewCouncilRepository.findByTopicAndMilestone(topic, Milestone.WEEK_4).getStatus() != Status.APPROVED) {
                throw new AppException(ErrorCode.STATUS_OF_PREVIOS_COUNCIL_NOT_VALID);
            }
        } else {
            if (size < 2) {
                throw new AppException(ErrorCode.PREVIOUS_REVIEW_COUNCIL_NOT_FOUND);
            }
            if (progressReviewCouncilRepository.findByTopicAndMilestone(topic, Milestone.WEEK_8).getStatus() != Status.APPROVED) {
                throw new AppException(ErrorCode.STATUS_OF_PREVIOS_COUNCIL_NOT_VALID);
            }
        }
//        List<Long> oldCouncilIDs = new ArrayList<>();
//        oldCouncilOfTopic.forEach(council -> {
//            oldCouncilIDs.add(council.getCouncilID());
//        });

        Set<Long> oldCouncilMemberIDs = new HashSet<>();
        oldCouncilOfTopic.forEach(council -> {
            List<ReviewCouncilMembers> members = reviewCouncilMembersRepository.findAllByProgressReviewCouncil(council);
            members.forEach(member -> {
                oldCouncilMemberIDs.add(member.getAccountID());
            });
        });
        for (Long id : memberIDs) {
            if (oldCouncilMemberIDs.contains(id)) {
                count++;
            }
        }

//        for(int i = 0; i < size; i++) {
//            Long oldLecturerID = oldCouncilMemberIDs.get(i);
//            if (memberIDs.contains(oldLecturerID)) {
//                count++;
//            }
//        }
        if (count != 1) {
            throw new AppException(ErrorCode.MEMBER_NOT_VALID);
        }
//        Long supervisorID = accountTopicsRepository.findByTopics(topic).getAccountId();
//        if (memberIDs.contains(supervisorID)) {
//            throw new AppException(ErrorCode.MEMBER_CANNOT_BE_SUPERVISOR);
//        }
        if (request.getReviewDate() != null) {
            throw new AppException(ErrorCode.REVIEW_DATE_FOR_WEEK_8_12_IS_AUTO_CALCULATED);
        }

        if (progressReviewCouncilRepository.findByTopicAndMilestone(topic, request.getMilestone()) != null) {
            throw new AppException(ErrorCode.REVIEW_COUNIL_FOR_THIS_WEEK_ALREADY_EXIST);
        }

    }

}
