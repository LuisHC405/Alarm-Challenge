import type { Request, Response } from 'express';
import { AlarmsService } from '../../../services/alarms.service';

export class AlarmsController {
  constructor(private readonly alarmsService: AlarmsService) {}
  list = async (_req: Request, res: Response): Promise<void> => this.respond(res, () => this.alarmsService.list(), (alarms) => ({ alarms }));
  create = async (req: Request, res: Response): Promise<void> => this.respond(res, () => this.alarmsService.create(req.body), (alarm) => ({ alarm }), 201);
  findById = async (req: Request, res: Response): Promise<void> => this.respondNotFound(res, () => this.alarmsService.findById(req.params.id));
  update = async (req: Request, res: Response): Promise<void> => this.respondNotFound(res, () => this.alarmsService.update(req.params.id, req.body));
  delete = async (req: Request, res: Response): Promise<void> => {
    try { if (!(await this.alarmsService.delete(req.params.id))) { res.status(404).json({ message: 'Alarme nao encontrado.' }); return; } res.status(204).send(); }
    catch (error) { this.sendError(res, error); }
  };
  private async respond<T>(res: Response, action: () => Promise<T>, body: (result: T) => object, status = 200): Promise<void> { try { res.status(status).json(body(await action())); } catch (error) { this.sendError(res, error); } }
  private async respondNotFound(res: Response, action: () => Promise<unknown | null>): Promise<void> { try { const alarm = await action(); if (!alarm) { res.status(404).json({ message: 'Alarme nao encontrado.' }); return; } res.status(200).json({ alarm }); } catch (error) { this.sendError(res, error); } }
  private sendError(res: Response, error: unknown): void { const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined; if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT') { res.status(503).json({ message: 'Banco de dados indisponivel. Verifique a DATABASE_URL e o PostgreSQL.', error: 'database_unavailable' }); return; } res.status(400).json({ message: error instanceof Error ? error.message : 'Erro ao processar alarme.' }); }
}
