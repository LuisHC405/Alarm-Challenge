require('dotenv').config();

const { createApp } = require('./src/serverApp');

const PORT = Number(process.env.PORT) || 3000;
const DEFAULT_MAX_ATTEMPTS = Number(process.env.MAX_ATTEMPTS) || 5;
const { app, alarm } = createApp({
  rootDir: __dirname,
  defaultMaxAttempts: DEFAULT_MAX_ATTEMPTS,
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Alarm Challenge rodando em http://localhost:${PORT}`);
  });
}

module.exports = {
  app,
  alarmState: alarm.alarmState,
  startNewChallenge: alarm.startNewChallenge,
  stopAlarm: alarm.stopAlarm,
};
