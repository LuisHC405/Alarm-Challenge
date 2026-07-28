const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const http = require('node:http');
const test = require('node:test');
const { createApp } = require('./src/serverApp');
const { generateMathQuestion } = require('./src/challenges/math');
const { generateProgrammingChallenge, normalizeCodeAnswer } = require('./src/challenges/programming');
const { normalizeChallengeType, normalizeDifficulty, normalizeTime } = require('./src/repositories/alarmRepository');

import type { IncomingMessage } from 'node:http';
import type { AlarmInput, AlarmRecord } from './src/models/alarm';

type TestServer = {
  server: import('node:http').Server;
  baseUrl: string;
};

type TestResponse = {
  status: number | undefined;
  body: any;
};

class MemoryAlarmRepository {
  private alarms: AlarmRecord[] = [];

  async list(): Promise<AlarmRecord[]> {
    return this.alarms;
  }

  async findById(id: string): Promise<AlarmRecord | null> {
    return this.alarms.find((alarm) => alarm.id === id) || null;
  }

  async create(input: AlarmInput): Promise<AlarmRecord> {
    const now = new Date().toISOString();
    const alarm: AlarmRecord = {
      id: randomUUID(),
      name: input.name?.trim() || 'Alarme',
      time: normalizeTime(input.time),
      challengeType: normalizeChallengeType(input.challengeType),
      difficulty: normalizeDifficulty(input.difficulty),
      enabled: input.enabled ?? true,
      createdAt: now,
      updatedAt: now,
    };

    this.alarms.push(alarm);
    return alarm;
  }

  async update(id: string, input: Partial<AlarmInput>): Promise<AlarmRecord | null> {
    const index = this.alarms.findIndex((alarm) => alarm.id === id);
    if (index === -1) return null;

    const current = this.alarms[index];
    const updated: AlarmRecord = {
      ...current,
      name: input.name === undefined ? current.name : input.name.trim() || current.name,
      time: input.time === undefined ? current.time : normalizeTime(input.time),
      challengeType: input.challengeType === undefined ? current.challengeType : normalizeChallengeType(input.challengeType),
      difficulty: input.difficulty === undefined ? current.difficulty : normalizeDifficulty(input.difficulty),
      enabled: input.enabled === undefined ? current.enabled : Boolean(input.enabled),
      updatedAt: new Date().toISOString(),
    };

    this.alarms[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const originalLength = this.alarms.length;
    this.alarms = this.alarms.filter((alarm) => alarm.id !== id);
    return this.alarms.length !== originalLength;
  }
}

const { app, alarm } = createApp({
  rootDir: process.cwd(),
  defaultMaxAttempts: 5,
  alarmRepository: new MemoryAlarmRepository(),
});
const { alarmState, stopAlarm } = alarm;

function listen(): Promise<TestServer> {
  const server = http.createServer(app);

  return new Promise((resolve) => {
    server.listen(0, () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

function request(baseUrl: string, path: string, options: { method?: string; body?: unknown } = {}): Promise<TestResponse> {
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
      (res: IncomingMessage) => {
        let data = '';
        res.on('data', (chunk: Buffer) => {
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

test('alarm CRUD creates, lists, updates and deletes saved alarms', async () => {
  stopAlarm();
  const { server, baseUrl } = await listen();

  try {
    const created = await request(baseUrl, '/alarms', {
      method: 'POST',
      body: {
        name: 'Teste CRUD',
        time: '07:30',
        challengeType: 'programming',
        difficulty: 'hard',
      },
    });

    assert.equal(created.status, 201);
    assert.equal(created.body.alarm.name, 'Teste CRUD');
    assert.equal(created.body.alarm.time, '07:30');

    const listed = await request(baseUrl, '/alarms');
    assert.equal(listed.status, 200);
    assert.ok(listed.body.alarms.some((alarm: any) => alarm.id === created.body.alarm.id));

    const updated = await request(baseUrl, `/alarms/${created.body.alarm.id}`, {
      method: 'PUT',
      body: { name: 'Teste Atualizado', enabled: false },
    });

    assert.equal(updated.status, 200);
    assert.equal(updated.body.alarm.name, 'Teste Atualizado');
    assert.equal(updated.body.alarm.enabled, false);

    const deleted = await request(baseUrl, `/alarms/${created.body.alarm.id}`, {
      method: 'DELETE',
    });

    assert.equal(deleted.status, 204);
  } finally {
    server.close();
  }
});
