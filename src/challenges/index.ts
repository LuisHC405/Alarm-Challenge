import { generateMathQuestion, isCorrectMathAnswer, type MathChallenge } from './math';
import { generateProgrammingChallenge, isCorrectProgrammingAnswer, type ProgrammingChallenge } from './programming';
import type { ChallengeType } from '../models/alarm';

export type Challenge = MathChallenge | ProgrammingChallenge;

type ChallengeAnswerInput = {
  challengeType: ChallengeType;
  answer: unknown;
  correctAnswer: unknown;
  acceptedAnswers: string[];
};

export function pickChallengeType(value: unknown): ChallengeType {
  return value === 'programming' ? 'programming' : 'math';
}

export function generateChallenge(type: unknown = 'math', difficulty: unknown = 'medium'): Challenge {
  if (pickChallengeType(type) === 'programming') {
    return generateProgrammingChallenge(difficulty);
  }

  return generateMathQuestion(difficulty);
}

export function isCorrectChallengeAnswer({
  challengeType,
  answer,
  correctAnswer,
  acceptedAnswers,
}: ChallengeAnswerInput): boolean {
  if (challengeType === 'programming') {
    return isCorrectProgrammingAnswer(answer, acceptedAnswers);
  }

  return isCorrectMathAnswer(answer, correctAnswer);
}
