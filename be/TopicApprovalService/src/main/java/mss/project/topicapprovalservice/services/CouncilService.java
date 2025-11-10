package mss.project.topicapprovalservice.services;

import jakarta.transaction.Transactional;
import mss.project.topicapprovalservice.dtos.requests.CouncilCreateRequest;
import mss.project.topicapprovalservice.dtos.responses.*;
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


    private List<AccountDTO> getAvailableLecturers(Set<Long> assignedLecturerIds, List<Long> topicListId) {
        // Lấy tất cả giảng viên
        List<AccountDTO> allLecturers = accountFeignClient.getAllAccounts();

        // Lấy danh sách giảng viên liên quan các topic
        Set<Long> topicRelatedSet = new HashSet<>();
        for (Long topicId : topicListId) {
            Topics topic = topicsRepository.findById(topicId)
                    .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));

            List<Long> topicRelatedLecturers = accountTopicsRepository
                    .findByTopics_Id(topicId)
                    .stream()
                    .map(AccountTopics::getAccountId)
                    .toList();
            topicRelatedSet.addAll(topicRelatedLecturers);
        }

        // Lọc ra giảng viên còn trống trong ngày và không liên quan topic
        return allLecturers.stream()
                .filter(acc -> !assignedLecturerIds.contains(acc.getId()))
                .filter(acc -> !topicRelatedSet.contains(acc.getId()))
                .toList();
    }

    @Transactional
    @Override
    public List<CouncilResponse> addCouncil(CouncilCreateRequest councilCreateRequest) {
        List<Long> allTopicIds = councilCreateRequest.getTopicId();
        List<CouncilResponse> createdCouncils = new ArrayList<>();

        // Biến quản lý giảng viên còn trống trong ngày
        Set<Long> assignedLecturerIdsInDay = new HashSet<>();
        LocalDate currentDefenseDate = null;

        // Chia danh sách topicId thành các nhóm 6
        for (int i = 0; i < allTopicIds.size(); i += 6) {
            List<Long> groupIds = allTopicIds.subList(i, Math.min(i + 6, allTopicIds.size()));

            // Lấy topic từ DB
            List<Topics> topicList = new ArrayList<>();
            for (Long topicId : groupIds) {
                Topics topic = topicsRepository.findById(topicId)
                        .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));
                if (topic.getCouncil() != null) {
                    throw new AppException(ErrorCode.TOPIC_ALREADY_ASSIGNED_TO_COUNCIL);
                }
                topicList.add(topic);
            }

            // Xác định ngày defense
            if (currentDefenseDate == null) {
                LocalDateTime earliestReview = topicList.stream()
                        .map(topic -> {
                            ProgressReviewCouncils reviewCouncil = progressReviewCouncilRepository
                                    .findByTopicAndMilestone(topic, Milestone.WEEK_12);
                            if (reviewCouncil == null) {
                                throw new AppException(ErrorCode.REVIEW_COUNCIL_NOT_FOUND);
                            }
                            if (!reviewCouncil.getStatus().equals(Status.APPROVED)) {
                                throw new AppException(ErrorCode.REVIEW_COUNCIL_NOT_APPROVED);
                            }
                            return reviewCouncil.getReviewDate();
                        })
                        .min(LocalDateTime::compareTo)
                        .orElseThrow(() -> new AppException(ErrorCode.REVIEW_COUNCIL_NOT_FOUND));
                currentDefenseDate = earliestReview.toLocalDate().plusWeeks(3);
            }

            // Lấy giảng viên còn trống trong ngày
            List<AccountDTO> availableLecturers = getAvailableLecturers(assignedLecturerIdsInDay, groupIds);

            // Nếu không đủ 4 giảng viên, sang ngày kế tiếp
            if (availableLecturers.size() < 4) {
                currentDefenseDate = currentDefenseDate.plusDays(1);
                assignedLecturerIdsInDay.clear();
                availableLecturers = getAvailableLecturers(assignedLecturerIdsInDay, groupIds);
            }

            // Chọn ngẫu nhiên 4 giảng viên
            List<AccountDTO> modifiableList = new ArrayList<>(availableLecturers);
            Collections.shuffle(modifiableList);
            List<AccountDTO> selectedMembers = modifiableList.subList(0, 4);

            // Gán giảng viên đã chọn vào ngày
            selectedMembers.forEach(acc -> assignedLecturerIdsInDay.add(acc.getId()));

            // Tạo Council mới
            Council council = new Council();
            council.setCouncilName("Hội Đồng Chấm ngày " + currentDefenseDate);
            council.setSemester("Học kỳ " + councilCreateRequest.getSemester());
            council.setStatus(Status.PLANNED);
            council.setDefenseDate(currentDefenseDate);
            councilRepository.save(council);

            // Gán thời gian defense cho từng topic
            LocalTime startTime = LocalTime.of(8, 0);
            int totalMinutesPerTopic = 90 + 15;
            for (int j = 0; j < topicList.size(); j++) {
                Topics topic = topicList.get(j);
                LocalTime topicTime = startTime.plusMinutes((long) j * totalMinutesPerTopic);
                if (j >= 3) topicTime = topicTime.plusMinutes(45);
                topic.setCouncil(council);
                topic.setDefenseTime(topicTime);
            }
            topicsRepository.saveAll(topicList);

            // Tạo hội đồng thành viên
            List<CouncilMember> members = new ArrayList<>();
            for (int j = 0; j < selectedMembers.size(); j++) {
                AccountDTO acc = selectedMembers.get(j);
                CouncilMember member = new CouncilMember();
                member.setAccountId(acc.getId());
                member.setCouncil(council);
                member.setRole(switch (j) {
                    case 0 -> Role.CHAIRMAN;
                    case 1 -> Role.SECRETARY;
                    default -> Role.MEMBER;
                });
                members.add(member);
            }
            councilMemberRepository.saveAll(members);
            council.setCouncilMembers(members);

            // Build response
            List<CouncilMemberResponse> memberResponses = members.stream()
                    .map(member -> {
                        AccountDTO acc = accountFeignClient.getAccountById(member.getAccountId());
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

            CouncilResponse response = CouncilResponse.builder()
                    .id(council.getId())
                    .councilName(council.getCouncilName())
                    .semester(council.getSemester())
                    .date(council.getDefenseDate().toString())
                    .status(council.getStatus())
                    .topic(topicResponses)
                    .councilMembers(memberResponses)
                    .build();

            createdCouncils.add(response);
        }

        return createdCouncils;
    }



    @Override
    public CouncilResponse updateCouncil(int id, CouncilCreateRequest councilCreateRequest) {
        return null;
    }

    @Override
    public void deleteCouncil(int id) {

    }

    @Override
    public CouncilResponse updateCouncilStatus(int id, String status) {
        Council council = councilRepository.findById((long) id)
                .orElseThrow(() -> new AppException(ErrorCode.COUNCIL_NOT_FOUND));
        council.setStatus(Status.valueOf(status));
        councilRepository.save(council);
        return CouncilResponse.builder()
                .id(council.getId())
                .councilName(council.getCouncilName())
                .semester(council.getSemester())
                .date(council.getDefenseDate().toString())
                .status(council.getStatus())
                .build();
    }

    @Override
    public  List<CouncilSummaryResponse> getCouncilResponseByAccountId(Long accountId) {
        List<CouncilMember> members = councilMemberRepository.findByAccountId(accountId);
        if(members.isEmpty()){;
            throw new AppException(ErrorCode.COUNCIL_MEMBER_NOT_FOUND);
        }

        List<CouncilSummaryResponse> summaries = new ArrayList<>();
        for (CouncilMember member : members) {
            Council council = member.getCouncil();
            Role role = member.getRole();
            Status status = council.getStatus();
            String councilName = council.getCouncilName();
            String semester = council.getSemester();
            String defenseDate = council.getDefenseDate().toString();
            for (Topics topic : council.getTopics()) {
                summaries.add(CouncilSummaryResponse.builder()
                        .role(role)
                        .councilName(councilName)
                        .semester(semester)
                        .defenseDate(defenseDate)
                        .defenseTime(topic.getDefenseTime())
                        .topicsTitle(topic.getTitle())
                        .fileUrl(topic.getFilePathUrl())
                        .topicsDescription(topic.getDescription())
                        .status(status)
                        .build());
            }
        }

        return summaries;
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
                AccountDTO creator = accountFeignClient.getAccountById(Long.valueOf(checkTopic.getCreatedBy()));
                TopicsDTOResponse topicResponse = TopicsDTOResponse.builder()
                        .id(checkTopic.getId())
                        .title(checkTopic.getTitle())
                        .description(checkTopic.getDescription())
                        .filePathUrl(checkTopic.getFilePathUrl())
                        .defenseTime(checkTopic.getDefenseTime())
                        .status(checkTopic.getStatus().toString())
                        .createdBy(creator.getName())
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
