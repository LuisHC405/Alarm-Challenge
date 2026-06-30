const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const { app, alarmState, stopAlarm } = require('./server');
const { generateMathQuestion } = require('./src/challenges/math');
const { generateProgrammingChallenge, normalizeCodeAnswer } = require('./src/challenges/programming');

function listen() {
  const server = http.createServer(app);

  return new Promise((resolve) => {
    server.listen(0, () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

function request(baseUrl, path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const body = options.body ? JSON.stringify(options.body) : null;
    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
          });
        });
      },
    );

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

test('generateMathQuestion always returns a solvable expression', () => {
  for (let index = 0; index < 200; index += 1) {
    const { question, correctAnswer } = generateMathQuestion('hard');
    const expression = question.replace('x', '*');
    const calculatedAnswer = Function(`"use strict"; return (${expression});`)();
    assert.equal(calculatedAnswer, correctAnswer);
  }
});

test('programming challenge accepts normalized TypeScript answers', () => {
  const challenge = generateProgrammingChallenge('easy');
  const acceptedAnswer = challenge.acceptedAnswers[0];

  assert.equal(normalizeCodeAnswer(`${acceptedAnswer}\n`), normalizeCodeAnswer(acceptedAnswer));
});

test('correct answer stops the alarm', async () => {
  stopAlarm();
  const { server, baseUrl } = await listen();

  try {
    const started = await request(baseUrl, '/alarm/start', {
      method: 'POST',
      body: { difficulty: 'easy', maxAttempts: 3 },
    });

    assert.equal(started.status, 201);
    assert.equal(started.body.status, 'active');

    const answered = await request(baseUrl, '/alarm/answer', {
      method: 'POST',
      body: { answer: alarmState.correctAnswer },
    });

    assert.equal(answered.status, 200);
    assert.equal(answered.body.correct, true);
    assert.equal(answered.body.status, 'inactive');
  } finally {
    server.close();
  }
});

test('correct programming answer stops the alarm', async () => {
  stopAlarm();
  const { server, baseUrl } = await listen();

  try {
    const started = await request(baseUrl, '/alarm/start', {
      method: 'POST',
      body: { challengeType: 'programming', difficulty: 'easy', maxAttempts: 3 },
    });

    assert.equal(started.status, 201);
    assert.equal(started.body.status, 'active');
    assert.equal(started.body.challengeType, 'programming');

    const answered = await request(baseUrl, '/alarm/answer', {
      method: 'POST',
      body: { answer: alarmState.correctAnswer },
    });

    assert.equal(answered.status, 200);
    assert.equal(answered.body.correct, true);
    assert.equal(answered.body.status, 'inactive');
  } finally {
    server.close();
  }
});

test('exhausted attempts keep alarm active with a new question', async () => {
  stopAlarm();
  const { server, baseUrl } = await listen();

  try {
    const started = await request(baseUrl, '/alarm/start', {
      method: 'POST',
      body: { difficulty: 'easy', maxAttempts: 1 },
    });
    const firstQuestion = started.body.question;

    const answered = await request(baseUrl, '/alarm/answer', {
      method: 'POST',
      body: { answer: alarmState.correctAnswer + 1 },
    });

    assert.equal(answered.status, 400);
    assert.equal(answered.body.correct, false);
    assert.equal(answered.body.status, 'active');
    assert.equal(answered.body.previousQuestion, firstQuestion);
    assert.ok(answered.body.question);
    assert.equal(answered.body.attemptsUsed, 0);
  } finally {
    stopAlarm();
    server.close();
  }
});
