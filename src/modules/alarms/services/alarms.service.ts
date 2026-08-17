import type { AlarmInput, AlarmRecord } from '../domain/alarm';
import type { AlarmRepository } from '../infra/orm/repositories/alarm.repository';

export class AlarmsService {
  constructor(private readonly repository: AlarmRepository) {}
  list(): Promise<AlarmRecord[]> { return this.repository.list(); }
  create(input: AlarmInput): Promise<AlarmRecord> { return this.repository.create(input); }
  findById(id: string): Promise<AlarmRecord | null> { return this.repository.findById(id); }
  update(id: string, input: Partial<AlarmInput>): Promise<AlarmRecord | null> { return this.repository.update(id, input); }
  delete(id: string): Promise<boolean> { return this.repository.delete(id); }
}
