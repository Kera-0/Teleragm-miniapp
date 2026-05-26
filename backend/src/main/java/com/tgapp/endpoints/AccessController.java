package com.tgapp.endpoints;

import com.tgapp.access.AccessControlService;
import com.tgapp.access.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/access")
@RequiredArgsConstructor
public class AccessController {

    private final AccessControlService accessControlService;

    @GetMapping("/me")
    public AccessResponse me(
            @RequestHeader(value = AccessControlService.TELEGRAM_USER_ID_HEADER, required = false)
            Long telegramUserId
    ) {
        return new AccessResponse(telegramUserId, accessControlService.resolveLevel(telegramUserId));
    }

    public record AccessResponse(Long telegramUserId, AccessLevel level) {}
}
