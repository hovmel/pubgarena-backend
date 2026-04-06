/**
 * Зарезервировано под интеграцию с официальным/партнёрским PUBG API:
 * профиль по pubg_id, код турнира, статистика по матчам.
 * Пока не вызывается из контроллеров.
 */
class PubgApiService {
  static async getPlayerByPubgId() {
    throw new Error('PUBG API integration not implemented');
  }

  static async createExternalTournament() {
    throw new Error('PUBG API integration not implemented');
  }

  static async getMatchStats() {
    throw new Error('PUBG API integration not implemented');
  }
}

export default PubgApiService;
