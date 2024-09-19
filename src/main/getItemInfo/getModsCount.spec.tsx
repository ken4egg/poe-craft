import { describe, expect, it } from '@jest/globals';
import { getModCount } from './getModsCount';

describe('Поиск совпадений по условиям', () => {
  it('Проверка работоспособности функции', () => {
    const variants: [string[], number][] = [
      [
        [
          'Minions have 5% increased Cast Speed',
          'Minions have 6% increased Attack Speed',
          '+110 to Armour',
        ],
        2,
      ],
      [
        [
          'Minions deal 20 to 32 additional Fire Damage',
          'Minions have 13% chance to Poison Enemies on Hit',
        ],
        2,
      ],
    ];

    variants.forEach(([variant, result]) => {
      expect(getModCount(variant)).toBe(result);
    });
  });
});
