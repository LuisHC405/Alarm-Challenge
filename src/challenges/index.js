const { generateMathQuestion, isCorrectMathAnswer } = require('./math');
const { generateProgrammingChallenge, isCorrectProgrammingAnswer } = require('./programming');

function pickChallengeType(value) {
  return value === 'programming' ? 'programming' : 'math';
}

function generateChallenge(type = 'math', difficulty = 'medium') {
  if (pickChallengeType(type) === 'programming') {
    return generateProgrammingChallenge(difficulty);
  }

  return generateMathQuestion(difficulty);
}

function isCorrectChallengeAnswer({ challengeType, answer, correctAnswer, acceptedAnswers }) {
  if (challengeType === 'programming') {
    return isCorrectProgrammingAnswer(answer, acceptedAnswers);
  }

  return isCorrectMathAnswer(answer, correctAnswer);
}

module.exports = {
  generateChallenge,
  isCorrectChallengeAnswer,
  pickChallengeType,
};
