import { Router } from 'express';
import { AlarmsController } from '../controllers/alarms.controller';
import { AlarmsService } from '../../../services/alarms.service';
import type { AlarmRepository } from '../../orm/repositories/alarm.repository';

export function createAlarmsRouter(repository: AlarmRepository): Router {
  const router = Router();
  const controller = new AlarmsController(new AlarmsService(repository));
  router.get('/', controller.list); router.post('/', controller.create); router.get('/:id', controller.findById); router.put('/:id', controller.update); router.delete('/:id', controller.delete);
  return router;
}
