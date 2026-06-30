const { pickDifficulty } = require('./math');
const { randomInt } = require('../utils/random');

const programmingChallenges = {
  easy: [
    {
      question: 'TypeScript: escreva uma linha que mostre Hello World no console.',
      correctAnswer: 'console.log("Hello World");',
      acceptedAnswers: [
        'console.log("Hello World");',
        "console.log('Hello World');",
        'console.log(`Hello World`);',
      ],
    },
    {
      question: 'TypeScript: crie uma constante chamada nome com o valor "Ana".',
      correctAnswer: 'const nome: string = "Ana";',
      acceptedAnswers: [
        'const nome: string = "Ana";',
        "const nome: string = 'Ana';",
        'const nome = "Ana";',
        "const nome = 'Ana';",
      ],
    },
  ],
  medium: [
    {
      question: 'TypeScript: crie uma funcao soma que recebe a e b como number e retorna a + b.',
      correctAnswer: 'function soma(a: number, b: number): number { return a + b; }',
      acceptedAnswers: [
        'function soma(a: number, b: number): number { return a + b; }',
        'function soma(a: number, b: number) { return a + b; }',
        'const soma = (a: number, b: number): number => a + b;',
        'const soma = (a: number, b: number) => a + b;',
      ],
    },
    {
      question: 'TypeScript: crie uma funcao ehPar que recebe n: number e retorna se n e par.',
      correctAnswer: 'function ehPar(n: number): boolean { return n % 2 === 0; }',
      acceptedAnswers: [
        'function ehPar(n: number): boolean { return n % 2 === 0; }',
        'function ehPar(n: number) { return n % 2 === 0; }',
        'const ehPar = (n: number): boolean => n % 2 === 0;',
        'const ehPar = (n: number) => n % 2 === 0;',
      ],
    },
  ],
  hard: [
    {
      question: 'TypeScript: crie uma funcao dobrarPares que recebe numbers: number[] e retorna apenas os pares dobrados.',
      correctAnswer: 'function dobrarPares(numbers: number[]): number[] { return numbers.filter((n) => n % 2 === 0).map((n) => n * 2); }',
      acceptedAnswers: [
        'function dobrarPares(numbers: number[]): number[] { return numbers.filter((n) => n % 2 === 0).map((n) => n * 2); }',
        'const dobrarPares = (numbers: number[]): number[] => numbers.filter((n) => n % 2 === 0).map((n) => n * 2);',
        'const dobrarPares = (numbers: number[]) => numbers.filter((n) => n % 2 === 0).map((n) => n * 2);',
      ],
    },
    {
      question: 'TypeScript: crie uma funcao nomesAtivos que recebe users e retorna os nomes dos usuarios ativos.',
      correctAnswer: 'function nomesAtivos(users: { name: string; active: boolean }[]): string[] { return users.filter((user) => user.active).map((user) => user.name); }',
      acceptedAnswers: [
        'function nomesAtivos(users: { name: string; active: boolean }[]): string[] { return users.filter((user) => user.active).map((user) => user.name); }',
        'const nomesAtivos = (users: { name: string; active: boolean }[]): string[] => users.filter((user) => user.active).map((user) => user.name);',
        'const nomesAtivos = (users: { name: string; active: boolean }[]) => users.filter((user) => user.active).map((user) => user.name);',
      ],
    },
  ],
};

function normalizeCodeAnswer(value) {
  return String(value)
    .trim()
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/\s+/g, '')
    .replace(/;+/g, '')
    .toLowerCase();
}

function generateProgrammingChallenge(difficulty = 'medium') {
  const list = programmingChallenges[pickDifficulty(difficulty)];
  return list[randomInt(0, list.length - 1)];
}

function isCorrectProgrammingAnswer(answer, acceptedAnswers) {
  const normalizedAnswer = normalizeCodeAnswer(answer);
  return acceptedAnswers.some((acceptedAnswer) => normalizeCodeAnswer(acceptedAnswer) === normalizedAnswer);
}

module.exports = {
  generateProgrammingChallenge,
  isCorrectProgrammingAnswer,
  normalizeCodeAnswer,
  programmingChallenges,
};
