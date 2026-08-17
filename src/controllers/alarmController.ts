import type { Request, Response } from 'express';
import type { AlarmRepository } from '../repositories/alarmRepository';

export class AlarmController {
  constructor(private repository: AlarmRepository) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    try {
      const alarms = await this.repository.list();
      res.status(200).json({ alarms });
    } catch (error) {
      sendRepositoryError(res, error, 'Erro ao listar alarmes.');
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const alarm = await this.repository.create(req.body);
      res.status(201).json({ alarm });
    } catch (error) {
      sendRepositoryError(res, error, 'Erro ao criar alarme.');
    }
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const alarm = await this.repository.findById(req.params.id);
      if (!alarm) {
        res.status(404).json({ message: 'Alarme nao encontrado.' });
        return;
      }

      res.status(200).json({ alarm });
    } catch (error) {
      sendRepositoryError(res, error, 'Erro ao buscar alarme.');
    }
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
      sendRepositoryError(res, error, 'Erro ao atualizar alarme.');
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const deleted = await this.repository.delete(req.params.id);
      if (!deleted) {
        res.status(404).json({ message: 'Alarme nao encontrado.' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      sendRepositoryError(res, error, 'Erro ao remover alarme.');
    }
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function sendRepositoryError(res: Response, error: unknown, fallback: string): void {
  if (isDatabaseConnectionError(error)) {
    res.status(503).json({
      message: 'Banco de dados indisponivel. Verifique se o PostgreSQL esta rodando e se a DATABASE_URL esta correta.',
      error: 'database_unavailable',
    });
    return;
  }

  res.status(400).json({ message: getErrorMessage(error, fallback) });
}

function isDatabaseConnectionError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT'),
  );
}
