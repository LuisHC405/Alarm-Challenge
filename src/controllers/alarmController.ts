import type { Request, Response } from 'express';
import type { AlarmRepository } from '../repositories/alarmRepository';

export class AlarmController {
  constructor(private repository: AlarmRepository) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const alarms = await this.repository.list();
    res.status(200).json({ alarms });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const alarm = await this.repository.create(req.body);
      res.status(201).json({ alarm });
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error, 'Erro ao criar alarme.') });
    }
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    const alarm = await this.repository.findById(req.params.id);
    if (!alarm) {
      res.status(404).json({ message: 'Alarme nao encontrado.' });
      return;
    }

    res.status(200).json({ alarm });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const alarm = await this.repository.update(req.params.id, req.body);
      if (!alarm) {
        res.status(404).json({ message: 'Alarme nao encontrado.' });
        return;
      }

      res.status(200).json({ alarm });
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error, 'Erro ao atualizar alarme.') });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const deleted = await this.repository.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Alarme nao encontrado.' });
      return;
    }

    res.status(204).send();
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
