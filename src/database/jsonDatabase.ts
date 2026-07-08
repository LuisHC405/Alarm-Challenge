import fs from 'node:fs/promises';
import path from 'node:path';

export class JsonDatabase<T> {
  constructor(private filePath: string, private fallbackData: T) {}

  async read(): Promise<T> {
    await this.ensureFile();
    const rawData = await fs.readFile(this.filePath, 'utf8');
    return JSON.parse(rawData) as T;
  }

  async write(data: T): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  private async ensureFile(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch {
      await this.write(this.fallbackData);
    }
  }
}
