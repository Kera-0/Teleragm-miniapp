package com.tgapp.access;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AccessControlService {

    public static final String TELEGRAM_USER_ID_HEADER = "X-Telegram-User-Id";

    private final AccessProperties accessProperties;

    public AccessLevel resolveLevel(Long telegramUserId) {
        if (telegramUserId == null) {
            return AccessLevel.BUYER;
        }

        if (accessProperties.getAdminIds().contains(telegramUserId)) {
            return AccessLevel.ADMIN;
        }

        if (accessProperties.getSellerIds().contains(telegramUserId)) {
            return AccessLevel.SELLER;
        }

        return AccessLevel.BUYER;
    }

    public void requireSellerOrAdmin(Long telegramUserId) {
        AccessLevel level = resolveLevel(telegramUserId);
        if (level != AccessLevel.SELLER && level != AccessLevel.ADMIN) {
            throw forbidden("Seller or admin access is required");
        }
    }

    public void requireAdmin(Long telegramUserId) {
        if (resolveLevel(telegramUserId) != AccessLevel.ADMIN) {
            throw forbidden("Admin access is required");
        }
    }

    public void requireSelf(Long currentTelegramUserId, Long targetTelegramUserId) {
        if (currentTelegramUserId == null || !currentTelegramUserId.equals(targetTelegramUserId)) {
            throw forbidden("Only the current Telegram user can perform this action");
        }
    }

    public void requireSelfOrSeller(Long currentTelegramUserId, Long targetTelegramUserId) {
        AccessLevel level = resolveLevel(currentTelegramUserId);
        if (level == AccessLevel.SELLER || level == AccessLevel.ADMIN) {
            return;
        }
        requireSelf(currentTelegramUserId, targetTelegramUserId);
    }

    private ResponseStatusException forbidden(String reason) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, reason);
    }
}
