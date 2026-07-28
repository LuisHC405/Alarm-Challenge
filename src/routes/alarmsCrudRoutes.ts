import express from 'express';
import { AlarmController } from '../controllers/alarmController';
import type { AlarmRepository } from '../repositories/alarmRepository';

export function createAlarmsCrudRouter(repository: AlarmRepository) {
  const router = express.Router();
  const controller = new AlarmController(repository);

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.findById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
