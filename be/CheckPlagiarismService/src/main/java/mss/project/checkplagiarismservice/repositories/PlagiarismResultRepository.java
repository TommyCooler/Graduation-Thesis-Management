package mss.project.checkplagiarismservice.repositories;

import mss.project.checkplagiarismservice.pojos.PlagiarismResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlagiarismResultRepository extends JpaRepository<PlagiarismResult, Long> {

    /**
     * Tìm tất cả kết quả đạo văn của một topic
     * @param topicId ID của topic cần tìm
     * @return Danh sách kết quả đạo văn
     */
    List<PlagiarismResult> findByTopicId(Long topicId);

    /**
     * Xóa tất cả kết quả đạo văn của một topic
     * @param topicId ID của topic cần xóa
     */
    void deleteByTopicId(Long topicId);

    /**
     * Kiểm tra xem topic có kết quả đạo văn hay không
     * @param topicId ID của topic cần kiểm tra
     * @return true nếu có kết quả đạo văn
     */
    boolean existsByTopicId(Long topicId);
}
