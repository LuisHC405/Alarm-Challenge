import 'dotenv/config';
import { createPostgresPool } from './src/database/postgres';
import { PostgresAlarmRepository } from './src/modules/alarms/infra/orm/repositories/postgres-alarm.repository';
import { createApp } from './src/serverApp';

const PORT = Number(process.env.PORT) || 3000;
const DEFAULT_MAX_ATTEMPTS = Number(process.env.MAX_ATTEMPTS) || 5;
const alarmRepository = new PostgresAlarmRepository(createPostgresPool());
const { app, alarm } = createApp({
  rootDir: process.cwd(),
  defaultMaxAttempts: DEFAULT_MAX_ATTEMPTS,
  alarmRepository,
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Alarm Challenge rodando em http://localhost:${PORT}`);
  });
}

export const alarmState = alarm.alarmState;
export const startNewChallenge = alarm.startNewChallenge;
export const stopAlarm = alarm.stopAlarm;
export { app };
