import path from 'node:path';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { createAlarmService } from './alarmService';
import type { AlarmRepository } from './repositories/alarmRepository';
import { createAlarmRouter } from './routes/alarmRoutes';
import { createAlarmsCrudRouter } from './routes/alarmsCrudRoutes';
import { createApiRouter } from './routes/apiRoutes';

type CreateAppOptions = {
  rootDir: string;
  defaultMaxAttempts: number;
  alarmRepository: AlarmRepository;
};

export function createApp({ rootDir, defaultMaxAttempts, alarmRepository }: CreateAppOptions) {
  const app = express();
  const alarm = createAlarmService(defaultMaxAttempts);
  const clientDir = path.join(rootDir, 'public', 'client');
  const publicDir = path.join(rootDir, 'public');

  app.use(cors());
  app.use(express.json());
  app.use('/assets', express.static(path.join(publicDir, 'assets')));
  app.use('/client', express.static(clientDir));

  app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDir, 'index.html'));
  });

  app.use('/api', createApiRouter());
  app.use('/alarm', createAlarmRouter(alarm));
  app.use('/alarms', createAlarmsCrudRouter(alarmRepository));

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      message: 'Rota nao encontrada.',
      path: req.path,
    });
  });

  return { app, alarm, alarmRepository };
}
