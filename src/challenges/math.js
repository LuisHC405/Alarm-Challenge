const { randomInt } = require('../utils/random');

const difficultyRanges = {
  easy: { min: 1, max: 20, operators: ['+', '-'] },
  medium: { min: 2, max: 60, operators: ['+', '-', '*', '/'] },
  hard: { min: 10, max: 120, operators: ['+', '-', '*', '/'] },
};

function pickDifficulty(value) {
  return difficultyRanges[value] ? value : 'medium';
}

function generateMathQuestion(difficulty = 'medium') {
  const selectedDifficulty = pickDifficulty(difficulty);
  const config = difficultyRanges[selectedDifficulty];
  const operator = config.operators[randomInt(0, config.operators.length - 1)];
  let num1 = randomInt(config.min, config.max);
  let num2 = randomInt(config.min, config.max);
  let correctAnswer;
  let question;

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

function isCorrectMathAnswer(answer, correctAnswer) {
  const numericAnswer = Number(answer);
  return Number.isFinite(numericAnswer) && numericAnswer === correctAnswer;
}

module.exports = {
  difficultyRanges,
  generateMathQuestion,
  isCorrectMathAnswer,
  pickDifficulty,
};
