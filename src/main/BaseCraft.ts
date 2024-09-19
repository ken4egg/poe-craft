import { mouse } from '@nut-tree-fork/nut-js';
import EventEmitter from 'events';
import { UiohookKey, uIOhook } from 'uiohook-napi';
import { getCurrencyObject } from '../shared/getCurrencyObject';
import {
  Cords,
  CraftInstance,
  CraftRule,
  CraftState,
  CraftStatus,
  Currency,
  LogMessage,
} from '../shared/interface';
import { ClipboardService } from './ClipboardService';
import { searchReplacerRegex } from './utils';

type UiohookKeyT = keyof typeof UiohookKey;

export interface BaseCraftOptions {
  logger?: (obj: LogMessage) => void;
  delay?: number;
  currencyPosition: Record<Currency, Cords | null>;
}

export interface CraftEvents {
  ['rules:update']: (payload: { name: string; rules: CraftRule[] }) => void; // Изменение правил крафта
  ['state:update']: (payload: CraftState) => void;
  ['currency:position:set']: (payload: Record<Currency, Cords | null>) => void;
  ['craft:update']: (payload: CraftInstance[]) => void;
}

export abstract class BaseCraft {
  protected clipboard = new ClipboardService();
  protected currencyPosition: Record<Currency, Cords | null>;
  protected delay: number;
  public state: CraftState = { status: 'IDLE' };
  protected logger?: BaseCraftOptions['logger'];
  protected currentInstance: CraftInstance | null = null;
  protected timestamp: number | null = null;
  protected emitter = new EventEmitter().setMaxListeners(0);
  protected craftRules: { name: string; rules: CraftRule[] } = { name: '', rules: [] };
  protected queue: CraftInstance[] = [];

  constructor(options: BaseCraftOptions) {
    this.currencyPosition = options.currencyPosition;
    this.logger = options.logger;
    this.delay = options.delay || 500;
  }

  emit = <Type extends keyof CraftEvents>(
    event: Type,
    payload: Parameters<CraftEvents[Type]>[0],
  ) => {
    return this.emitter.emit(event, payload);
  };

  on = <Type extends keyof CraftEvents>(event: Type, callback: CraftEvents[Type]) => {
    this.emitter.on(event, callback);

    return () => {
      this.emitter.off(event, callback);
    };
  };

  setCraftRules = (data: { name: string; rules: CraftRule[] }) => {
    const normalizedData = data.rules.map((item) => ({
      ...item,
      mods: item.mods.map((x) => ({
        ...x,
        value: x.value.replace(searchReplacerRegex, '#'),
      })),
    }));

    this.craftRules.name = data.name;
    this.craftRules.rules = normalizedData;

    this.emit('rules:update', { name: data.name, rules: normalizedData });
  };

  setLogger = (logger: BaseCraftOptions['logger']): void => {
    this.logger = logger;
  };

  protected wait = async (value?: number) => {
    return new Promise((res) => setTimeout(res, typeof value === 'number' ? value : this.delay));
  };

  protected changeStatus = (status: CraftStatus) => {
    this.state.status = status;
    this.emit('state:update', this.state);
  };

  protected finishCurrent = () => {
    if (this.currentInstance) {
      this.currentInstance.isReady = true;
    }

    this.snapshotTimestamp();

    this.clipboard.clear();

    if (this.queue.every((item) => item.isReady)) {
      return this.changeStatus('IDLE');
    }

    return this.next();
  };

  public pause = (): void => {
    this.changeStatus('PAUSED');

    this.snapshotTimestamp();
  };

  public resume = (): void => {
    this.changeStatus('IN_WORK');
    this.run();
  };

  setCurrencyPosition = (currency: Currency, cords: Cords) => {
    this.currencyPosition[currency] = cords;
    this.emit('currency:position:set', this.currencyPosition);
  };

  addCraftCords = (o: Cords): void => {
    const { x, y } = o;
    this.queue.push({
      cords: { x, y },
      currencyCount: { ...getCurrencyObject(0) },
      isReady: false,
      times: [],
    });
    this.logger?.({
      message: `Координаты x: ${x} y: ${y}`,
      label: `Добавлен новый предмет #${this.queue.length}`,
      type: 'INFO',
    });
    this.notify();
  };

  protected snapshotTimestamp() {
    const endTime = Date.now();

    if (this.timestamp) {
      this.currentInstance?.times.push({ start: this.timestamp, end: endTime });
      this.timestamp = null;
      this.notify();
    }
  }

  protected notify(): void {
    this.emit('craft:update', this.queue);
  }

  protected getCurrentInstance = (): CraftInstance => {
    if (this.currentInstance && !this.currentInstance.isReady) {
      return this.currentInstance;
    }

    const result = this.queue.find((item) => !item.isReady);

    if (result) {
      this.currentInstance = result;
    } else {
      this.changeStatus('IDLE');
      throw new Error('Empty coords');
    }

    return this.currentInstance;
  };

  setDelay = (value: number) => {
    this.delay = value;
  };

  protected next = () => {
    return setTimeout(this._work, this.delay);
  };

  protected goToCurrentCraftCoords = async (): Promise<void> => {
    await mouse.move([this.getCurrentInstance().cords]);
  };

  protected useOrb = async (currency: Currency): Promise<void> => {
    const orbPosition = this.currencyPosition[currency];

    if (!orbPosition) {
      throw new Error('Wrong currency or position not set');
    }

    await mouse.move([orbPosition]);
    await mouse.rightClick();
    await this.goToCurrentCraftCoords();
    await mouse.leftClick();

    if (typeof this.currentInstance?.currencyCount[currency] === 'number') {
      this.currentInstance.currencyCount[currency] += 1;
    }

    this.notify();
  };

  protected _work = async () => {
    if (this.state.status !== 'IN_WORK') {
      return;
    }

    if (this.timestamp === null) {
      this.timestamp = Date.now();
    }

    if (this.craftRules.rules.length === 0) {
      this.logger?.({
        message: `Wrong or empty rules`,
        type: 'ERROR',
      });
      this.changeStatus('IDLE');

      throw new Error('wrong rules');
    }

    await this.work();
  };

  abstract work: () => Promise<void>;
  abstract prefixes: string[];
  abstract suffixes: string[];

  public async run(): Promise<void> {
    this.changeStatus('IN_WORK');

    setTimeout(this.work, this.delay);
  }

  protected async pressKeysToCopyItemText(): Promise<void> {
    let keys = 'Ctrl + C'.split(' + ');
    keys = keys.filter((key) => key !== 'C');

    for (const key of keys) {
      uIOhook.keyToggle(UiohookKey[key as UiohookKeyT], 'down');
    }

    uIOhook.keyTap(UiohookKey.C);

    keys.reverse();
    for (const key of keys) {
      uIOhook.keyToggle(UiohookKey[key as UiohookKeyT], 'up');
    }
  }
}
