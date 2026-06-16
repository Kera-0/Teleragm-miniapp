const DEMO_TELEGRAM_USER_ID = 1001;
const DEV_TELEGRAM_USER_ID_KEY = 'tgapp.devTelegramUserId';

function getDevTelegramUserIdOverride() {
  const params = new URLSearchParams(window.location.search);

  if (params.has('resetTgUserId')) {
    window.localStorage.removeItem(DEV_TELEGRAM_USER_ID_KEY);
    return null;
  }

  const queryUserId = params.get('tgUserId');
  if (queryUserId) {
    const parsedUserId = Number(queryUserId);
    if (Number.isSafeInteger(parsedUserId) && parsedUserId > 0) {
      window.localStorage.setItem(DEV_TELEGRAM_USER_ID_KEY, String(parsedUserId));
      return parsedUserId;
    }
  }

  const storedUserId = Number(window.localStorage.getItem(DEV_TELEGRAM_USER_ID_KEY));
  return Number.isSafeInteger(storedUserId) && storedUserId > 0 ? storedUserId : null;
}

export function getTelegramUserId() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user?.id
    ?? getDevTelegramUserIdOverride()
    ?? DEMO_TELEGRAM_USER_ID;
}

export function initTelegramViewport() {
  window.Telegram?.WebApp?.ready?.();
  window.Telegram?.WebApp?.expand?.();
}
