import 'dotenv/config';
import { createApp } from './src/serverApp';

const PORT = Number(process.env.PORT) || 3000;
const DEFAULT_MAX_ATTEMPTS = Number(process.env.MAX_ATTEMPTS) || 5;
const { app, alarm } = createApp({
  rootDir: process.cwd(),
  defaultMaxAttempts: DEFAULT_MAX_ATTEMPTS,
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Alarm Challenge rodando em http://localhost:${PORT}`);
  });
}

export const alarmState = alarm.alarmState;
export const startNewChallenge = alarm.startNewChallenge;
export const stopAlarm = alarm.stopAlarm;
export { app };
