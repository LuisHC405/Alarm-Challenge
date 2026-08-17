import { generateChallenge, isCorrectChallengeAnswer, pickChallengeType } from './challenges';
import { pickDifficulty } from './challenges/math';
import type { ChallengeType, Difficulty } from './modules/alarms/domain/alarm';

type AlarmState = {
  isActive: boolean;
  challengeType: ChallengeType;
  currentQuestion: string | null;
  correctAnswer: string | number | null;
  acceptedAnswers: string[];
  attemptCount: number;
  maxAttempts: number;
  difficulty: Difficulty;
  startedAt: string | null;
  solvedAt: string | null;
};

type AlarmResponse = {
  httpStatus: number;
  body: Record<string, unknown>;
};

export type AlarmService = ReturnType<typeof createAlarmService>;

export function createAlarmService(defaultMaxAttempts: number) {
  const alarmState: AlarmState = {
    isActive: false,
    challengeType: 'math',
    currentQuestion: null,
    correctAnswer: null,
    acceptedAnswers: [],
    attemptCount: 0,
    maxAttempts: defaultMaxAttempts,
    difficulty: 'medium',
    startedAt: null,
    solvedAt: null,
  };

  function publicState() {
    return {
      status: alarmState.isActive ? 'active' : 'inactive',
      isActive: alarmState.isActive,
      challengeType: alarmState.challengeType,
      question: alarmState.currentQuestion,
      attemptsUsed: alarmState.attemptCount,
      attemptsRemaining: alarmState.maxAttempts - alarmState.attemptCount,
      maxAttempts: alarmState.maxAttempts,
      difficulty: alarmState.difficulty,
      startedAt: alarmState.startedAt,
      solvedAt: alarmState.solvedAt,
    };
  }

  function startNewChallenge(difficulty: unknown = alarmState.difficulty, challengeType: unknown = alarmState.challengeType) {
    const selectedChallengeType = pickChallengeType(challengeType);
    const selectedDifficulty = pickDifficulty(difficulty);
    const challenge = generateChallenge(selectedChallengeType, selectedDifficulty);

    alarmState.isActive = true;
    alarmState.challengeType = selectedChallengeType;
    alarmState.currentQuestion = challenge.question;
    alarmState.correctAnswer = challenge.correctAnswer;
    alarmState.acceptedAnswers =
      'acceptedAnswers' in challenge ? challenge.acceptedAnswers : [String(challenge.correctAnswer)];
    alarmState.attemptCount = 0;
    alarmState.difficulty = selectedDifficulty;
    alarmState.startedAt = alarmState.startedAt || new Date().toISOString();
    alarmState.solvedAt = null;
  }

  function stopAlarm() {
    alarmState.isActive = false;
    alarmState.currentQuestion = null;
    alarmState.correctAnswer = null;
    alarmState.acceptedAnswers = [];
    alarmState.attemptCount = 0;
    alarmState.startedAt = null;
    alarmState.solvedAt = new Date().toISOString();
  }

  function configureAttempts(maxAttempts: number) {
    alarmState.maxAttempts = Number.isInteger(maxAttempts) && maxAttempts > 0 ? maxAttempts : defaultMaxAttempts;
  }

  function validateAnswer(answer: unknown): boolean {
    alarmState.attemptCount += 1;

    return isCorrectChallengeAnswer({
      challengeType: alarmState.challengeType,
      answer,
      correctAnswer: alarmState.correctAnswer,
      acceptedAnswers: alarmState.acceptedAnswers,
    });
  }

  function answerChallenge(answer: unknown): AlarmResponse {
    if (validateAnswer(answer)) {
      const attempts = alarmState.attemptCount;
      stopAlarm();

      return {
        httpStatus: 200,
        body: {
          message: 'Resposta correta. Alarme desligado!',
          status: 'stopped',
          correct: true,
          attempts,
        },
      };
    }

    if (alarmState.attemptCount >= alarmState.maxAttempts) {
      return {
        httpStatus: 400,
        body: {
          message: 'Tentativas esgotadas. O alarme continua tocando com um novo desafio.',
          correct: false,
          ...rotateChallengeAfterFailure(),
        },
      };
    }

    return {
      httpStatus: 400,
      body: {
        message: 'Resposta incorreta. Tente novamente.',
        correct: false,
      },
    };
  }

  function rotateChallengeAfterFailure() {
    const previousQuestion = alarmState.currentQuestion;
    const previousCorrectAnswer = alarmState.correctAnswer;
    startNewChallenge(alarmState.difficulty, alarmState.challengeType);

    return {
      previousQuestion,
      previousCorrectAnswer,
    };
  }

  return {
    alarmState,
    answerChallenge,
    configureAttempts,
    publicState,
    rotateChallengeAfterFailure,
    startNewChallenge,
    stopAlarm,
    validateAnswer,
  };
}
