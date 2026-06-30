const { generateChallenge, isCorrectChallengeAnswer, pickChallengeType } = require('./challenges');
const { pickDifficulty } = require('./challenges/math');

function createAlarmService(defaultMaxAttempts) {
  const alarmState = {
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

  function startNewChallenge(difficulty = alarmState.difficulty, challengeType = alarmState.challengeType) {
    const challenge = generateChallenge(challengeType, difficulty);

    alarmState.isActive = true;
    alarmState.challengeType = pickChallengeType(challengeType);
    alarmState.currentQuestion = challenge.question;
    alarmState.correctAnswer = challenge.correctAnswer;
    alarmState.acceptedAnswers = challenge.acceptedAnswers || [String(challenge.correctAnswer)];
    alarmState.attemptCount = 0;
    alarmState.difficulty = pickDifficulty(difficulty);
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

  function configureAttempts(maxAttempts) {
    alarmState.maxAttempts = Number.isInteger(maxAttempts) && maxAttempts > 0 ? maxAttempts : defaultMaxAttempts;
  }

  function validateAnswer(answer) {
    alarmState.attemptCount += 1;

    return isCorrectChallengeAnswer({
      challengeType: alarmState.challengeType,
      answer,
      correctAnswer: alarmState.correctAnswer,
      acceptedAnswers: alarmState.acceptedAnswers,
    });
  }

  function answerChallenge(answer) {
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

module.exports = {
  createAlarmService,
};
