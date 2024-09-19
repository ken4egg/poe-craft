import { Cords, Currency } from './interface';

export function getCurrencyObject<T extends number | null | Cords>(x: T): Record<Currency, T> {
  return {
    'Scroll of Wisdom': x,
    'Chaos Orb': x,
    'Exalted Orb': x,
    'Vaal Orb': x,
    'Orb of Scouring': x,
    'Orb of Regal': x,
    'Orb of Alteration': x,
    'Orb of Alchemy': x,
    'Orb of Augmentation': x,
    'Orb of Transmutation': x,
  };
}
