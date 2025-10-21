package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.CouncilCreateRequest;
import mss.project.topicapprovalservice.dtos.responses.AccountDTO;
import mss.project.topicapprovalservice.dtos.responses.CouncilMemberResponse;
import mss.project.topicapprovalservice.dtos.responses.CouncilResponse;
import mss.project.topicapprovalservice.enums.Role;
import mss.project.topicapprovalservice.enums.Status;
import mss.project.topicapprovalservice.exceptions.AppException;
import mss.project.topicapprovalservice.exceptions.ErrorCode;
import mss.project.topicapprovalservice.pojos.Council;
import mss.project.topicapprovalservice.pojos.CouncilMember;
import mss.project.topicapprovalservice.pojos.Topics;
import mss.project.topicapprovalservice.repositories.AccountTopicsRepository;
import mss.project.topicapprovalservice.repositories.CouncilMemberRepository;
import mss.project.topicapprovalservice.repositories.CouncilRepository;
import mss.project.topicapprovalservice.repositories.TopicsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

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

    private static final Random RANDOM = new Random();

    private LocalDate getDateFromSemester(String semester) {
        int Year = LocalDate.now().getYear();
        return switch (semester.toUpperCase()){
            case "SPRING" -> LocalDate.of(Year, 3, 1);
            case "SUMMER" -> LocalDate.of(Year, 6, 1);
            case "FALL" -> LocalDate.of(Year, 9, 1);
            case "WINTER" -> LocalDate.of(Year, 12, 1);
            default -> throw new AppException(ErrorCode.INVALID_SEMESTER);
        };
    }


    private List<AccountDTO> getAvailableLecturers(LocalDate date, int slot, Long topicId) {
        List<Long> busyIds = councilMemberRepository.findBusyLecturers(date, slot);
        List<Long> topicRelatedLecturers = accountTopicsRepository.findAccountIdsByTopicId(topicId);
        List<AccountDTO> allLecturers = accountFeignClient.getAllAccounts();

        return allLecturers.stream()
                .filter(acc -> !busyIds.contains(acc.getId()))
                .filter(acc -> !topicRelatedLecturers.contains(acc.getId()))
                .toList();
    }

    @Override
    public CouncilResponse addCouncil(CouncilCreateRequest councilCreateRequest) {
        Topics topic = topicsRepository.findById(councilCreateRequest.getTopicId())
                .orElseThrow(() -> new AppException(ErrorCode.TOPICS_NOT_FOUND));
        Council council = new Council();
        council.setCouncilName("Hội đồng "+topic.getTitle());
        council.setSemester(councilCreateRequest.getSemester());
        council.setStatus(Status.PLANNED);
        council.setTopic(topic);

        LocalDate  startDate = getDateFromSemester(councilCreateRequest.getSemester());

        int dayOffset = new Random().nextInt(5); // 0 -> 4
        LocalDate defenseDate = startDate.plusDays(dayOffset);
        council.setDate(LocalDate.from(defenseDate.atStartOfDay()));

        int randomSlot = new Random().nextInt(5) + 1;
        council.setSlot(randomSlot);

        List<AccountDTO> availableLecturers = getAvailableLecturers(defenseDate, randomSlot, topic.getId());
        if(availableLecturers.size() < 4){
            throw new AppException(ErrorCode.NOT_ENOUGH_LECTURERS);
        }

        Collections.shuffle(availableLecturers);
        List<AccountDTO> selectedMembers = availableLecturers.subList(0,4);

        List<CouncilMember> members = new ArrayList<>();
        for(int i =0;i<selectedMembers.size();i++){
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
        council.setCouncilMembers(members);
        councilRepository.save(council);

        CouncilResponse councilResponse = new CouncilResponse();
        councilResponse.setId(council.getId());
        councilResponse.setCouncilName(council.getCouncilName());
        councilResponse.setSemester(council.getSemester());
        councilResponse.setDate(council.getDate().toString());
        councilResponse.setSlot(council.getSlot());
        councilResponse.setStatus(council.getStatus());
        councilResponse.setTopicName(topic.getTitle());
        List<CouncilMemberResponse> memberResponses = new ArrayList<>();
        for(CouncilMember member : members){
            AccountDTO acc = accountFeignClient.getAccountById(member.getAccountId());
            CouncilMemberResponse memberResponse = new CouncilMemberResponse();
            memberResponse.setId(member.getId());
            memberResponse.setAccountId(acc.getId());
            memberResponse.setFullName(acc.getName());
            memberResponse.setEmail(acc.getEmail());
            memberResponse.setRole(member.getRole());
            memberResponses.add(memberResponse);
        }
        return councilResponse;
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
    public List<Council> getAllCouncils() {
        return List.of();
    }
}
