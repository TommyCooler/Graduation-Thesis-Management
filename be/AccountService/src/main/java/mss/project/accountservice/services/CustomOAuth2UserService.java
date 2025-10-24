package mss.project.accountservice.services;

import lombok.RequiredArgsConstructor;
import mss.project.accountservice.enums.Role;
import mss.project.accountservice.pojos.Account;
import mss.project.accountservice.repositories.AccountRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final AccountRepository accountRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User user = super.loadUser(userRequest);
        String email = user.<String>getAttribute("email");
        String name  = user.<String>getAttribute("name");
        if (email == null || !email.toLowerCase().endsWith("@fpt.edu.vn")) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_email_domain", "Chỉ có mail FPT mới được đăng nhập", null)
            );
        }

        Account acc = accountRepository.findByEmail(email);
        if (acc == null) {
            acc = new Account();
            acc.setEmail(email.toLowerCase());
            acc.setName(name);
            acc.setRole(Role.LECTURER);
            acc.setActive(true);
            accountRepository.save(acc);
        } else if (!acc.isActive()) {
            acc.setActive(true);
            accountRepository.save(acc);
        }

        return user;
    }
}
