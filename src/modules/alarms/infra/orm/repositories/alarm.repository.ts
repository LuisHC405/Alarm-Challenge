import type { AlarmInput, AlarmRecord, ChallengeType, Difficulty, Weekday } from '../../../domain/alarm';

export interface AlarmRepository {
  list(): Promise<AlarmRecord[]>;
  findById(id: string): Promise<AlarmRecord | null>;
  create(input: AlarmInput): Promise<AlarmRecord>;
  update(id: string, input: Partial<AlarmInput>): Promise<AlarmRecord | null>;
  delete(id: string): Promise<boolean>;
}

const challengeTypes = new Set<ChallengeType>(['math', 'programming']);
const difficulties = new Set<Difficulty>(['easy', 'medium', 'hard']);
const weekdays = new Set<Weekday>(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']);
export const everyWeekday: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function normalizeTime(time: string): string {
  if (!/^\d{2}:\d{2}$/.test(time)) throw new Error('Horario invalido. Use HH:mm.');
  const [hours, minutes] = time.split(':').map(Number);
  if (hours > 23 || minutes > 59) throw new Error('Horario invalido. Use HH:mm.');
  return time;
}

export function normalizeChallengeType(value: ChallengeType | undefined): ChallengeType {
  return value && challengeTypes.has(value) ? value : 'math';
}

export function normalizeDifficulty(value: Difficulty | undefined): Difficulty {
  return value && difficulties.has(value) ? value : 'medium';
}

export function normalizeWeekdays(value: unknown): Weekday[] {
  if (value === undefined) return [...everyWeekday];
  if (!Array.isArray(value) || value.length === 0 || value.some((day) => typeof day !== 'string' || !weekdays.has(day as Weekday))) {
    throw new Error('Selecione pelo menos um dia da semana.');
  }
  return everyWeekday.filter((day) => value.includes(day));
}

export function normalizeScheduledDate(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00`))) {
    throw new Error('Data inválida. Use o calendário para selecionar uma data.');
  }
  return value;
}
