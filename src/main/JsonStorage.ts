import electron from 'electron';
import path from 'path';
import fs from 'fs';

export class JsonStorage<T extends Record<string, unknown>> {
  private data: T;
  private path: string;
  constructor(opts: { configName: string; defaults: T }) {
    const userDataPath = electron.app.getPath('userData');

    this.path = path.join(userDataPath, opts.configName + '.json');

    console.log('Reading config from:');
    console.log(this.path);
    this.data = Object.assign(opts.defaults, parseDataFile(this.path, opts.defaults));
  }

  getConfigPath(): string {
    return this.path;
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.data[key];
  }

  set<K extends keyof T>(key: K, val: T[K]) {
    this.data[key] = val;

    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    return defaults;
  }
}
