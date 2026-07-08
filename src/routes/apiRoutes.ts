import { Router, type Request, type Response } from 'express';

export function createApiRouter(): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'API Alarm Challenge online',
      version: '2.0.0',
      rule: 'O alarme so desliga quando o desafio estiver correto.',
      endpoints: {
        'POST /alarm/start': 'Inicia o alarme e gera um desafio',
        'GET /alarm/status': 'Mostra o estado atual do alarme',
        'GET /alarm/question': 'Mostra a questao atual',
        'POST /alarm/answer': 'Valida a resposta enviada',
        'GET /alarms': 'Lista alarmes salvos',
        'POST /alarms': 'Cria um alarme',
        'GET /alarms/:id': 'Busca um alarme',
        'PUT /alarms/:id': 'Atualiza um alarme',
        'DELETE /alarms/:id': 'Remove um alarme',
      },
    });
  });

  return router;
}
