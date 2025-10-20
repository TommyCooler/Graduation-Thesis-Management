package mss.project.checkplagiarismservice.services;

import mss.project.checkplagiarismservice.repositories.PlagiarismRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PlagiarismService {

    @Autowired
    private PlagiarismRepository plagiarismRepository;

    public String checkPlagiarism(@RequestBody MultipartFile file) {
        return "";
    }

}
