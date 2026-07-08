import express from 'express';
import { AlarmRepository } from '../repositories/alarmRepository';

export function createAlarmsCrudRouter(repository: AlarmRepository) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const alarms = await repository.list();
    res.status(200).json({ alarms });
  });

  router.post('/', async (req, res) => {
    try {
      const alarm = await repository.create(req.body);
      res.status(201).json({ alarm });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Erro ao criar alarme.' });
    }
  });

  router.get('/:id', async (req, res) => {
    const alarm = await repository.findById(req.params.id);
    if (!alarm) {
      return res.status(404).json({ message: 'Alarme nao encontrado.' });
    }

    return res.status(200).json({ alarm });
  });

  router.put('/:id', async (req, res) => {
    try {
      const alarm = await repository.update(req.params.id, req.body);
      if (!alarm) {
        return res.status(404).json({ message: 'Alarme nao encontrado.' });
      }

      return res.status(200).json({ alarm });
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : 'Erro ao atualizar alarme.' });
    }
  });

  router.delete('/:id', async (req, res) => {
    const deleted = await repository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Alarme nao encontrado.' });
    }

    return res.status(204).send();
  });

  return router;
}
