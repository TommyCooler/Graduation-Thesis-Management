package mss.project.accountservice.services;

import lombok.RequiredArgsConstructor;
import mss.project.accountservice.enums.Role;
import mss.project.accountservice.exceptions.AppException;
import mss.project.accountservice.exceptions.ErrorCode;
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

        Account acc = accountRepository.findByEmail(email);
        if (acc == null) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("account_not_found", "Tài khoản chưa được cấp phép ", null)
            );
        } else if (!acc.isActive()) {
            acc.setActive(true);
            accountRepository.save(acc);
        }

        return user;
    }
}
