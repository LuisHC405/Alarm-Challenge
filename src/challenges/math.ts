import { randomInt } from '../utils/random';
import type { Difficulty } from '../models/alarm';

type MathOperator = '+' | '-' | '*' | '/';

type MathDifficultyConfig = {
  min: number;
  max: number;
  operators: MathOperator[];
};

export type MathChallenge = {
  question: string;
  correctAnswer: number;
};

export const difficultyRanges: Record<Difficulty, MathDifficultyConfig> = {
  easy: { min: 1, max: 20, operators: ['+', '-'] },
  medium: { min: 2, max: 60, operators: ['+', '-', '*', '/'] },
  hard: { min: 10, max: 120, operators: ['+', '-', '*', '/'] },
};

export function pickDifficulty(value: unknown): Difficulty {
  return typeof value === 'string' && value in difficultyRanges ? (value as Difficulty) : 'medium';
}

export function generateMathQuestion(difficulty: unknown = 'medium'): MathChallenge {
  const selectedDifficulty = pickDifficulty(difficulty);
  const config = difficultyRanges[selectedDifficulty];
  const operator = config.operators[randomInt(0, config.operators.length - 1)];
  let num1 = randomInt(config.min, config.max);
  let num2 = randomInt(config.min, config.max);
  let correctAnswer: number;
  let question: string;

  switch (operator) {
    case '+':
      correctAnswer = num1 + num2;
      question = `${num1} + ${num2}`;
      break;
    case '-':
      if (num2 > num1) {
        [num1, num2] = [num2, num1];
      }
      correctAnswer = num1 - num2;
      question = `${num1} - ${num2}`;
      break;
    case '*':
      num1 = randomInt(config.min, selectedDifficulty === 'hard' ? 15 : 10);
      num2 = randomInt(config.min, selectedDifficulty === 'hard' ? 15 : 10);
      correctAnswer = num1 * num2;
      question = `${num1} x ${num2}`;
      break;
    case '/': {
      const divisor = randomInt(2, selectedDifficulty === 'hard' ? 20 : 12);
      const quotient = randomInt(2, selectedDifficulty === 'hard' ? 20 : 12);
      num1 = divisor * quotient;
      num2 = divisor;
      correctAnswer = quotient;
      question = `${num1} / ${num2}`;
      break;
    }
    default:
      correctAnswer = num1 + num2;
      question = `${num1} + ${num2}`;
  }

  return { question, correctAnswer };
}

export function isCorrectMathAnswer(answer: unknown, correctAnswer: unknown): boolean {
  const numericAnswer = Number(answer);
  return Number.isFinite(numericAnswer) && numericAnswer === correctAnswer;
}
