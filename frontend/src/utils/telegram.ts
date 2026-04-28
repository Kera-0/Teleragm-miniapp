const DEMO_TELEGRAM_USER_ID = 1001;

export function getTelegramUserId() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user?.id ?? DEMO_TELEGRAM_USER_ID;
}

export function initTelegramViewport() {
  window.Telegram?.WebApp?.ready?.();
  window.Telegram?.WebApp?.expand?.();
}
