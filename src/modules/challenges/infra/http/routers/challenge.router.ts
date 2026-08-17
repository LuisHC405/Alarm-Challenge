import { Router, type Request, type Response } from 'express';
import { pickChallengeType } from '../../../../../challenges';
import { pickDifficulty } from '../../../../../challenges/math';
import type { AlarmService } from '../../../../../alarmService';

export function createChallengeRouter(alarm: AlarmService): Router {
  const router = Router();
  const sendState = (res: Response, status: number, body: Record<string, unknown>) => res.status(status).json({ ...body, ...alarm.publicState() });

  router.post('/start', (req: Request, res: Response) => {
    if (alarm.alarmState.isActive) return sendState(res, 409, { message: 'O alarme ja esta ativo. Resolva o desafio atual para desliga-lo.' });
    alarm.configureAttempts(Number(req.body?.maxAttempts));
    alarm.startNewChallenge(pickDifficulty(req.body?.difficulty), pickChallengeType(req.body?.challengeType));
    return sendState(res, 201, { message: 'Alarme iniciado. Resolva o desafio para parar.' });
  });
  router.get('/status', (_req, res) => sendState(res, 200, { message: alarm.alarmState.isActive ? 'Alarme tocando. Responda ao desafio.' : 'Alarme desligado.' }));
  router.get('/question', (_req, res) => alarm.alarmState.isActive ? sendState(res, 200, {}) : sendState(res, 404, { message: 'Nao ha alarme ativo no momento.' }));
  router.post('/answer', (req, res) => {
    const answer = req.body?.answer;
    if (!alarm.alarmState.isActive) return sendState(res, 400, { message: 'Nao ha alarme ativo no momento.' });
    if (answer === undefined || answer === null || String(answer).trim() === '') return sendState(res, 400, { message: 'Envie uma resposta no campo "answer".', error: 'answer_required' });
    const result = alarm.answerChallenge(answer);
    return sendState(res, result.httpStatus, result.body);
  });
  return router;
}
