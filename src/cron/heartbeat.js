import cron from 'node-cron';

/** Пример cron-задачи: раз в сутки в 00:00 UTC. Замените на свою логику. */
export function setupHeartbeatCron() {
  cron.schedule('0 0 * * *', () => {
    console.log('[cron] heartbeat');
  });
}
