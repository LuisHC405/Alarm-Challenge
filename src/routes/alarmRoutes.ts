import { Router, type Request, type Response } from 'express';
import { pickChallengeType } from '../challenges';
import { pickDifficulty } from '../challenges/math';
import type { AlarmService } from '../alarmService';

export function createAlarmRouter(alarm: AlarmService): Router {
  const router = Router();
  const sendState = (res: Response, status: number, body: Record<string, unknown>) =>
    res.status(status).json({ ...body, ...alarm.publicState() });

  router.post('/start', (req: Request, res: Response) => {
    if (alarm.alarmState.isActive) {
      return sendState(res, 409, {
        message: 'O alarme ja esta ativo. Resolva o desafio atual para desliga-lo.',
      });
    }

    const difficulty = pickDifficulty(req.body?.difficulty);
    const challengeType = pickChallengeType(req.body?.challengeType);
    const maxAttempts = Number(req.body?.maxAttempts);
    alarm.configureAttempts(maxAttempts);
    alarm.startNewChallenge(difficulty, challengeType);

    return sendState(res, 201, {
      message: 'Alarme iniciado. Resolva o desafio para parar.',
    });
  });

  router.get('/status', (_req: Request, res: Response) => {
    return sendState(res, 200, {
      message: alarm.alarmState.isActive ? 'Alarme tocando. Responda ao desafio.' : 'Alarme desligado.',
    });
  });

  router.get('/question', (_req: Request, res: Response) => {
    if (!alarm.alarmState.isActive) {
      return sendState(res, 404, {
        message: 'Nao ha alarme ativo no momento.',
      });
    }

    return sendState(res, 200, {});
  });

  router.post('/answer', (req: Request, res: Response) => {
    if (!alarm.alarmState.isActive) {
      return sendState(res, 400, {
        message: 'Nao ha alarme ativo no momento.',
      });
    }

    const answer = req.body?.answer;
    if (answer === undefined || answer === null || String(answer).trim() === '') {
      return sendState(res, 400, {
        message: 'Envie uma resposta no campo "answer".',
        error: 'answer_required',
      });
    }

    const result = alarm.answerChallenge(answer);
    return sendState(res, result.httpStatus, result.body);
  });

  return router;
}
