import type { AlarmInput, AlarmRecord, ChallengeType, Difficulty } from '../../../domain/alarm';

export interface AlarmRepository {
  list(): Promise<AlarmRecord[]>;
  findById(id: string): Promise<AlarmRecord | null>;
  create(input: AlarmInput): Promise<AlarmRecord>;
  update(id: string, input: Partial<AlarmInput>): Promise<AlarmRecord | null>;
  delete(id: string): Promise<boolean>;
}

const challengeTypes = new Set<ChallengeType>(['math', 'programming']);
const difficulties = new Set<Difficulty>(['easy', 'medium', 'hard']);

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
