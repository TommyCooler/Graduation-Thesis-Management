package mss.project.topicapprovalservice.services;

import jakarta.transaction.Transactional;
import mss.project.topicapprovalservice.dtos.requests.CouncilCreateRequest;
import mss.project.topicapprovalservice.dtos.responses.AccountDTO;
import mss.project.topicapprovalservice.dtos.responses.CouncilMemberResponse;
import mss.project.topicapprovalservice.dtos.responses.CouncilResponse;
import mss.project.topicapprovalservice.dtos.responses.TopicsDTOResponse;
import mss.project.topicapprovalservice.enums.Milestone;
import mss.project.topicapprovalservice.enums.Role;
import mss.project.topicapprovalservice.enums.Status;
import mss.project.topicapprovalservice.exceptions.AppException;
import mss.project.topicapprovalservice.exceptions.ErrorCode;
import mss.project.topicapprovalservice.pojos.*;
import mss.project.topicapprovalservice.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class CouncilService implements ICouncilService {

    @Autowired
    private CouncilRepository councilRepository;

    @Autowired
    private CouncilMemberRepository councilMemberRepository;

    @Autowired
    private TopicsRepository topicsRepository;

    @Autowired
    private AccountService accountFeignClient;

    @Autowired
    private AccountTopicsRepository accountTopicsRepository;

    @Autowired
    private ProgressReviewCouncilRepository progressReviewCouncilRepository;

    private static final Random RANDOM = new Random();


    private LocalDateTime getRandomDefenseDateInWeek15(List<Topics> topics) {

        LocalDateTime LastReviewDate = topics.stream()
                .map(topic -> {
                    ProgressReviewCouncils reviewCouncil = progressReviewCouncilRepository.findByTopicAndMilestone(topic, Milestone.WEEK_12);
                    if (reviewCouncil == null) {
                        throw new AppException(ErrorCode.REVIEW_COUNCIL_NOT_FOUND);
                    }
                    if(!reviewCouncil.getStatus().equals(Status.APPROVED)) {
                        throw new AppException(ErrorCode.REVIEW_COUNCIL_NOT_APPROVED);
                    }
                    return reviewCouncil.getReviewDate();
                })
                .max(LocalDateTime::compareTo)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_COUNCIL_NOT_FOUND));
        LocalDateTime week15Start = LastReviewDate.toLocalDate().plusWeeks(3).atStartOfDay();
        week15Start = week15Start.with(java.time.DayOfWeek.MONDAY);
        LocalDateTime week15End = week15Start.with(DayOfWeek.SATURDAY);

        long days = ChronoUnit.DAYS.between(week15Start, week15End);
        long randomOffset = ThreadLocalRandom.current().nextLong(days + 1);
        return week15Start.plusDays(randomOffset);
    }


    private List<AccountDTO> getAvailableLecturers(LocalDate date,  List<Long> topicListId) {
        List<Long> busyIds = councilMemberRepository
                .findByCouncil_DefenseDate(date)
                .stream()
                .map(CouncilMember::getAccountId)
                .toList();
        Set<Long> busySet = new HashSet<>(busyIds);


        Set<Long> topicRelatedSet = new HashSet<>();
        for(Long topicId : topicListId) {
            Topics topic = topicsRepository.findById(topicId)
                    .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));

            List<Long> topicRelatedLecturers = accountTopicsRepository
                    .findByTopics_Id(topicId)
                    .stream()
                    .map(AccountTopics::getAccountId)
                    .toList();
            topicRelatedSet.addAll(topicRelatedLecturers);
        }
        List<AccountDTO> allLecturers = accountFeignClient.getAllAccounts();

        return allLecturers.stream()
                .filter(acc -> !busySet.contains(acc.getId()))
                .filter(acc -> !topicRelatedSet.contains(acc.getId()))
                .toList();
    }

    @Transactional
    @Override
    public CouncilResponse addCouncil(CouncilCreateRequest councilCreateRequest) {

        List<Topics> topicList = new ArrayList<>();
        for (Long topicId : councilCreateRequest.getTopicId()) {
            Topics topic = topicsRepository.findById(topicId)
                    .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));
            if (topic.getCouncil() != null) {
                throw new AppException(ErrorCode.TOPIC_ALREADY_ASSIGNED_TO_COUNCIL);
            }
            topicList.add(topic);
        }

        LocalDateTime date = getRandomDefenseDateInWeek15(topicList);
        LocalDate defenseDate = date.toLocalDate();

        Council council = new Council();
        council.setCouncilName("Hội Đồng Chấm ngày "+defenseDate);
        council.setSemester("Học kỳ"+councilCreateRequest.getSemester());
        council.setStatus(Status.PLANNED);
        council.setDefenseDate(defenseDate);

        councilRepository.save(council);

        LocalTime startTime = LocalTime.of(8, 0);
        int totalMinutesPerTopic = 90 + 15; // 1 tiếng 30p + 15p nghỉ = 105 phút

        for (int i = 0; i < topicList.size(); i++) {
            Topics topic = topicList.get(i);
            LocalTime topicTime = startTime.plusMinutes((long) i * totalMinutesPerTopic);
            topic.setCouncil(council);
            topic.setDefenseTime(topicTime);
        }
        topicsRepository.saveAll(topicList);

        List<AccountDTO> availableLecturers = getAvailableLecturers(defenseDate, councilCreateRequest.getTopicId());
        if (availableLecturers.size() < 4) {
            throw new AppException(ErrorCode.NOT_ENOUGH_LECTURERS);
        }

        List<AccountDTO> modifiableList = new ArrayList<>(availableLecturers);
        Collections.shuffle(modifiableList);
        List<AccountDTO> selectedMembers = modifiableList.subList(0, 4);
        List<CouncilMember> members = new ArrayList<>();
        for (int i = 0; i < selectedMembers.size(); i++) {
            AccountDTO acc = selectedMembers.get(i);
            CouncilMember member = new CouncilMember();
            member.setAccountId(acc.getId());
            member.setCouncil(council);
            member.setRole(switch (i) {
                case 0 -> Role.CHAIRMAN;
                case 1 -> Role.SECRETARY;
                default -> Role.MEMBER;
            });
            members.add(member);
        }
        councilMemberRepository.saveAll(members);
        council.setCouncilMembers(members);

        List<CouncilMemberResponse> memberResponses = members.stream()
                .map(member -> {
                    AccountDTO acc = accountFeignClient.getAccountById(member.getAccountId());
                    if (acc == null) {
                        throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
                    }
                    return CouncilMemberResponse.builder()
                            .id(member.getId())
                            .accountId(acc.getId())
                            .fullName(acc.getName())
                            .email(acc.getEmail())
                            .role(member.getRole())
                            .phoneNumber(acc.getPhoneNumber())
                            .build();
                })
                .toList();
        List<TopicsDTOResponse> topicResponses = topicList.stream()
                .map(topic -> TopicsDTOResponse.builder()
                        .id(topic.getId())
                        .title(topic.getTitle())
                        .description(topic.getDescription())
                        .build())
                .toList();

        return CouncilResponse.builder()
                .id(council.getId())
                .councilName(council.getCouncilName())
                .semester(council.getSemester())
                .date(council.getDefenseDate().toString())
                .status(council.getStatus())
                .topic(topicResponses)
                .councilMembers(memberResponses)
                .build();
    }

    @Override
    public CouncilResponse updateCouncil(int id, CouncilCreateRequest councilCreateRequest) {
        return null;
    }

    @Override
    public void deleteCouncil(int id) {

    }

    @Override
    public Council getCouncilById(int id) {
        return null;
    }

    @Override
    public List<CouncilResponse> getAllCouncils() {
        List<Council> councilList =councilRepository.findAll();
        List <CouncilResponse> councilResponses = new ArrayList<>();
        for(Council council : councilList){
            List<CouncilMember> members = council.getCouncilMembers();
            List<CouncilMemberResponse> memberResponses = new ArrayList<>();
            for(CouncilMember member : members){
                AccountDTO acc = accountFeignClient.getAccountById(member.getAccountId());
                if(acc == null){
                    throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
                }
                CouncilMemberResponse memberResponse = CouncilMemberResponse.builder()
                        .id(member.getId())
                        .accountId(acc.getId())
                        .fullName(acc.getName())
                        .email(acc.getEmail())
                        .role(member.getRole())
                        .phoneNumber(acc.getPhoneNumber())
                        .build();
                memberResponses.add(memberResponse);
            }
            List<Topics> topics = council.getTopics();
            List<TopicsDTOResponse> topicResponses = new ArrayList<>();
            for(Topics topic : topics){
                Topics checkTopic= topicsRepository.findById(topic.getId())
                        .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));
                TopicsDTOResponse topicResponse = TopicsDTOResponse.builder()
                        .id(checkTopic.getId())
                        .title(checkTopic.getTitle())
                        .description(checkTopic.getDescription())
                        .build();
                topicResponses.add(topicResponse);
            }
            council.setCouncilMembers(members);
            CouncilResponse councilResponse = CouncilResponse.builder()
                    .id(council.getId())
                    .councilName(council.getCouncilName())
                    .semester(council.getSemester())
                    .date(council.getDefenseDate().toString())
                    .status(council.getStatus())
                    .topic(topicResponses)
                    .councilMembers(memberResponses)
                    .build();
            councilResponses.add(councilResponse);
        }
        return councilResponses;
    }
}
