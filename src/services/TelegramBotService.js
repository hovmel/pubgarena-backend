/**
 * Зарезервировано под Telegraf (как в Nomad-Back).
 * Реализацию проверки доступа к боту добавить позже: polling, webhooks, связка с User.telegram_*.
 */
class TelegramBotService {
  static startPolling() {
    if (process.env.TELEGRAM_BOT_TOKEN) {
      /* TODO: Telegraf — проверка telegram_bot_access_granted у User */
    }
  }
}

export default TelegramBotService;
