export interface Cords {
  x: number;
  y: number;
}

export interface CraftRule {
  id: number;
  mods: { value: string; min: number | null; max: number | null }[];
  additional: {
    quantity?: number;
    rarity?: number;
    packSize?: number;
    moreMaps?: number;
    moreScarabs?: number;
    moreCurrency?: number;
  };
  action: Currency | 'ready';
}

export type LogMessage = {
  message: string;
  type: 'ERROR' | 'WARNING' | 'INFO';
  color?: string;
  label?: string;
  date?: Date;
};

export interface CraftState {
  status: CraftStatus;
}

export type CraftMod = 'Maps' | 'Flasks';

export type Currency =
  | 'Scroll of Wisdom'
  | 'Chaos Orb'
  | 'Exalted Orb'
  | 'Vaal Orb'
  | 'Orb of Scouring'
  | 'Orb of Alteration'
  | 'Orb of Alchemy'
  | 'Orb of Augmentation'
  | 'Orb of Transmutation'
  | 'Orb of Regal';

export type CraftInstance = {
  cords: Cords;
  isReady: boolean;
  currencyCount: Record<Currency, number>;
  times: { start: number; end: number }[];
};

export type CraftStatus = 'IDLE' | 'IN_WORK' | 'PAUSED';
