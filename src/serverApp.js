const path = require('path');
const express = require('express');
const cors = require('cors');
const { createAlarmService } = require('./alarmService');
const { createAlarmRouter } = require('./routes/alarmRoutes');
const { createApiRouter } = require('./routes/apiRoutes');

function createApp({ rootDir, defaultMaxAttempts }) {
  const app = express();
  const alarm = createAlarmService(defaultMaxAttempts);
  const clientDir = path.join(rootDir, 'src', 'client');
  const publicDir = path.join(rootDir, 'public');

  app.use(cors());
  app.use(express.json());
  app.use('/assets', express.static(path.join(publicDir, 'assets')));
  app.use('/client', express.static(clientDir));

  app.get('/', (req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
  });

  app.use('/api', createApiRouter());
  app.use('/alarm', createAlarmRouter(alarm));

  app.use((req, res) => {
    res.status(404).json({
      message: 'Rota nao encontrada.',
      path: req.path,
    });
  });

  return { app, alarm };
}

module.exports = {
  createApp,
};
