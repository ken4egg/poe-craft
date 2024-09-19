import { clipboard } from 'electron';

const POLL_DELAY = 48;
const POLL_LIMIT = 500;

export class ClipboardService {
  private pollPromise?: Promise<string>;
  private elapsed = 0;

  get isPolling(): boolean {
    return this.pollPromise != null;
  }

  clear() {
    clipboard.writeText('');
  }

  async readItemText(): Promise<string> {
    this.elapsed = 0;
    if (this.pollPromise) {
      return await this.pollPromise;
    }
    // clipboard.clear();
    clipboard.writeText('');
    this.pollPromise = new Promise((resolve, reject) => {
      const poll = (): void => {
        const textAfter = clipboard.readText();
        if (textAfter !== '') {
          this.pollPromise = undefined;
          resolve(textAfter);
        } else {
          this.elapsed += POLL_DELAY;
          if (this.elapsed < POLL_LIMIT) {
            setTimeout(poll, POLL_DELAY);
          } else {
            this.pollPromise = undefined;
            reject(new ClipboardTimeoutError('Reading clipboard timed out'));
          }
        }
      };
      setTimeout(poll, POLL_DELAY);
    });
    return this.pollPromise;
  }
}

export class ClipboardTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ClipboardTimeoutError';
  }
}
