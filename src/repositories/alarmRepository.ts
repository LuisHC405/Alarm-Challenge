import { randomUUID } from 'node:crypto';
import { AlarmInput, AlarmRecord, ChallengeType, Difficulty } from '../models/alarm';
import { JsonDatabase } from '../database/jsonDatabase';

type AlarmDatabase = {
  alarms: AlarmRecord[];
};

const allowedChallengeTypes = new Set<ChallengeType>(['math', 'programming']);
const allowedDifficulties = new Set<Difficulty>(['easy', 'medium', 'hard']);

export class AlarmRepository {
  constructor(private database: JsonDatabase<AlarmDatabase>) {}

  async list(): Promise<AlarmRecord[]> {
    const data = await this.database.read();
    return data.alarms;
  }

  async findById(id: string): Promise<AlarmRecord | null> {
    const alarms = await this.list();
    return alarms.find((alarm) => alarm.id === id) || null;
  }

  async create(input: AlarmInput): Promise<AlarmRecord> {
    const data = await this.database.read();
    const now = new Date().toISOString();
    const alarm: AlarmRecord = {
      id: randomUUID(),
      name: input.name?.trim() || 'Alarme',
      time: this.normalizeTime(input.time),
      challengeType: this.normalizeChallengeType(input.challengeType),
      difficulty: this.normalizeDifficulty(input.difficulty),
      enabled: input.enabled ?? true,
      createdAt: now,
      updatedAt: now,
    };

    data.alarms.push(alarm);
    await this.database.write(data);
    return alarm;
  }

  async update(id: string, input: Partial<AlarmInput>): Promise<AlarmRecord | null> {
    const data = await this.database.read();
    const index = data.alarms.findIndex((alarm) => alarm.id === id);
    if (index === -1) return null;

    const current = data.alarms[index];
    const updated: AlarmRecord = {
      ...current,
      name: input.name === undefined ? current.name : input.name.trim() || current.name,
      time: input.time === undefined ? current.time : this.normalizeTime(input.time),
      challengeType: input.challengeType === undefined ? current.challengeType : this.normalizeChallengeType(input.challengeType),
      difficulty: input.difficulty === undefined ? current.difficulty : this.normalizeDifficulty(input.difficulty),
      enabled: input.enabled === undefined ? current.enabled : Boolean(input.enabled),
      updatedAt: new Date().toISOString(),
    };

    data.alarms[index] = updated;
    await this.database.write(data);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const data = await this.database.read();
    const originalLength = data.alarms.length;
    data.alarms = data.alarms.filter((alarm) => alarm.id !== id);
    await this.database.write(data);
    return data.alarms.length !== originalLength;
  }

  private normalizeTime(time: string): string {
    if (!/^\d{2}:\d{2}$/.test(time)) {
      throw new Error('Horario invalido. Use HH:mm.');
    }

    const [hours, minutes] = time.split(':').map(Number);
    if (hours > 23 || minutes > 59) {
      throw new Error('Horario invalido. Use HH:mm.');
    }

    return time;
  }

  private normalizeChallengeType(value: ChallengeType | undefined): ChallengeType {
    return value && allowedChallengeTypes.has(value) ? value : 'math';
  }

  private normalizeDifficulty(value: Difficulty | undefined): Difficulty {
    return value && allowedDifficulties.has(value) ? value : 'medium';
  }
}
