import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import type { AlarmInput, AlarmRecord, ChallengeType, Difficulty, Weekday } from '../../../domain/alarm';
import { normalizeChallengeType, normalizeDifficulty, normalizeScheduledDate, normalizeTime, normalizeWeekdays, type AlarmRepository } from './alarm.repository';

type AlarmRow = {
  id: string; name: string; time: string; challenge_type: ChallengeType; difficulty: Difficulty;
  enabled: boolean; weekdays: Weekday[]; scheduled_date: string | null; created_at: Date; updated_at: Date;
};

export class PostgresAlarmRepository implements AlarmRepository {
  private schemaReady: Promise<void> | null = null;

  constructor(private readonly pool: Pool) {}

  async list(): Promise<AlarmRecord[]> {
    await this.ensureSchema();
    const result = await this.pool.query<AlarmRow>('SELECT id, name, time, challenge_type, difficulty, enabled, weekdays, scheduled_date, created_at, updated_at FROM alarms ORDER BY time ASC, created_at ASC');
    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<AlarmRecord | null> {
    await this.ensureSchema();
    const result = await this.pool.query<AlarmRow>('SELECT id, name, time, challenge_type, difficulty, enabled, weekdays, scheduled_date, created_at, updated_at FROM alarms WHERE id = $1', [id]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(input: AlarmInput): Promise<AlarmRecord> {
    await this.ensureSchema();
    const result = await this.pool.query<AlarmRow>(
      'INSERT INTO alarms (id, name, time, challenge_type, difficulty, enabled, weekdays, scheduled_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, time, challenge_type, difficulty, enabled, weekdays, scheduled_date, created_at, updated_at',
      [randomUUID(), input.name?.trim() || 'Alarme', normalizeTime(input.time), normalizeChallengeType(input.challengeType), normalizeDifficulty(input.difficulty), input.enabled ?? true, normalizeWeekdays(input.weekdays), normalizeScheduledDate(input.scheduledDate)],
    );
    return mapRow(result.rows[0]);
  }

  async update(id: string, input: Partial<AlarmInput>): Promise<AlarmRecord | null> {
    const current = await this.findById(id);
    if (!current) return null;
    const result = await this.pool.query<AlarmRow>(
      'UPDATE alarms SET name = $2, time = $3, challenge_type = $4, difficulty = $5, enabled = $6, weekdays = $7, scheduled_date = $8, updated_at = NOW() WHERE id = $1 RETURNING id, name, time, challenge_type, difficulty, enabled, weekdays, scheduled_date, created_at, updated_at',
      [id, input.name === undefined ? current.name : input.name.trim() || current.name, input.time === undefined ? current.time : normalizeTime(input.time), input.challengeType === undefined ? current.challengeType : normalizeChallengeType(input.challengeType), input.difficulty === undefined ? current.difficulty : normalizeDifficulty(input.difficulty), input.enabled === undefined ? current.enabled : Boolean(input.enabled), input.weekdays === undefined ? current.weekdays : normalizeWeekdays(input.weekdays), input.scheduledDate === undefined ? current.scheduledDate : normalizeScheduledDate(input.scheduledDate)],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureSchema();
    const result = await this.pool.query('DELETE FROM alarms WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  private ensureSchema(): Promise<void> {
    this.schemaReady ??= this.pool.query(`CREATE TABLE IF NOT EXISTS alarms (
      id UUID PRIMARY KEY, name TEXT NOT NULL,
      time CHAR(5) NOT NULL CHECK (time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
      challenge_type TEXT NOT NULL DEFAULT 'math' CHECK (challenge_type IN ('math', 'programming')),
      difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      weekdays TEXT[] NOT NULL DEFAULT ARRAY['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']::TEXT[],
      scheduled_date DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`).then(() => this.pool.query("ALTER TABLE alarms ADD COLUMN IF NOT EXISTS weekdays TEXT[] NOT NULL DEFAULT ARRAY['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']::TEXT[]; ALTER TABLE alarms ADD COLUMN IF NOT EXISTS scheduled_date DATE;")).then(() => undefined);
    return this.schemaReady;
  }
}

function mapRow(row: AlarmRow): AlarmRecord {
  return { id: row.id, name: row.name, time: row.time, challengeType: row.challenge_type, difficulty: row.difficulty, enabled: row.enabled, weekdays: normalizeWeekdays(row.weekdays), scheduledDate: row.scheduled_date, createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString() };
}
