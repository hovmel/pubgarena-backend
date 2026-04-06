import { setupHeartbeatCron } from './heartbeat';

const setupCron = () => {
  setupHeartbeatCron();
  console.log('Cron is set up');
};

export default setupCron;
