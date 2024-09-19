import { describe, expect, it } from '@jest/globals';
import { CraftRule } from '../shared/interface';
import { searchPairs } from './searchPairs';

describe('Поиск совпадений по условиям', () => {
  it('Поиск c min 3 позитивных результата', () => {
    const actions: CraftRule[] = [
      {
        id: 1,
        action: 'ready',
        additional: {},
        mods: [
          { value: '+# to Strength', min: null, max: null },
          { value: '# increased maximum Life', min: null, max: null },
        ],
      },
      {
        id: 1,
        action: 'ready',
        additional: {},
        mods: [
          { value: '+# to Strength', min: 15, max: null },
          { value: '# increased maximum Life', min: 7, max: null },
        ],
      },
      {
        id: 1,
        action: 'ready',
        additional: {},
        mods: [{ value: '# increased maximum Life', min: null, max: null }],
      },
      {
        id: 1,
        action: 'ready',
        additional: {},
        mods: [{ value: '+# to Strength', min: null, max: null }],
      },
      {
        id: 1,
        action: 'ready',
        additional: {},
        mods: [{ value: '+# to Strength', min: 15, max: null }],
      },
    ];
    expect(searchPairs(actions, ['+10 to Strength', '7% increased maximum Life'])).toHaveLength(3);
  });

  it('Все значения из заданных модов должны быть найдены обязательно', () => {
    const actions: CraftRule[] = [
      {
        id: 1,
        action: 'ready',
        additional: {},
        mods: [
          { value: '# chance to Poison on Hit', min: null, max: null },
          {
            value: '# increased maximum Life',
            min: 7,
            max: null,
          },
        ],
      },
    ];

    expect(
      searchPairs(actions, ['4% chance to Poison on Hit', '6% increased Poison Duration']),
    ).toHaveLength(0);

    expect(
      searchPairs(actions, [
        '4% chance to Poison on Hit',
        '6% increased Poison Duration',
        '7% increased maximum Life',
      ]),
    ).toHaveLength(1);
  });

  it('Не строгий поиск strict=false', () => {
    const actions: CraftRule[] = [
      {
        id: 1,
        action: 'ready',
        additional: {},
        mods: [
          { value: '+# to Strength', min: null, max: null },
          { value: '# increased maximum Life', min: null, max: null },
        ],
      },
      {
        id: 1,
        action: 'ready',
        additional: {},
        mods: [
          { value: '+# to Strength', min: null, max: null },
          { value: '# increased maximum Life', min: 7, max: null },
        ],
      },
    ];
    expect(searchPairs(actions, ['7% increased maximum Life'], { strict: false })).toHaveLength(2);
  });

  it('4 модификатора', () => {
    const actions: CraftRule[] = [
      {
        id: 1,
        action: 'ready',
        additional: {},
        mods: [
          { value: '+# to Strength', min: null, max: null },
          { value: '# increased maximum Life', min: null, max: null },
          { value: '', min: null, max: null },
          { value: '', min: null, max: null },
        ],
      },
    ];
    expect(searchPairs(actions, ['7% increased maximum Life'], { strict: false })).toHaveLength(1);
  });

  it('4 модификатора и строгий поиск', () => {
    const actions: CraftRule[] = [
      {
        id: 1,
        action: 'ready',
        additional: {},
        mods: [
          { value: '# increased maximum Life', min: null, max: null },
          { value: '', min: null, max: null },
          { value: '', min: null, max: null },
          { value: '', min: null, max: null },
        ],
      },
    ];
    expect(searchPairs(actions, ['7% increased maximum Life'], { strict: true })).toHaveLength(1);
  });

  it('Двойные параметры в строке', () => {
    const actions: CraftRule[] = [
      {
        id: 1,
        action: 'ready',
        additional: {},
        mods: [
          { value: 'Minions deal # to # additional Lightning Damage', min: null, max: null },
          { value: '', min: null, max: null },
          { value: '', min: null, max: null },
          { value: '', min: null, max: null },
        ],
      },
    ];

    expect(
      searchPairs(actions, ['Minions deal 2 to 37 additional Lightning Damage'], { strict: false }),
    ).toHaveLength(1);
  });

  it('Двойные параметры в строке с ограничениями', () => {
    const actions: CraftRule[] = [
      {
        id: 1,
        action: 'ready',
        additional: {},
        mods: [{ value: 'Minions deal # to # additional Lightning Damage', min: 35, max: null }],
      },
      {
        id: 1,
        action: 'ready',
        additional: {},
        mods: [{ value: 'Minions deal # to # additional Lightning Damage', min: 38, max: null }],
      },
    ];

    expect(
      searchPairs(actions, ['Minions deal 2 to 37 additional Lightning Damage'], {
        strict: false,
      }),
    ).toHaveLength(1);
  });

  it('Модификатор без значения', () => {
    const actions: CraftRule[] = [
      {
        id: 1,
        action: 'ready',
        additional: {},
        mods: [
          {
            value: 'Immunity to Bleeding and Corrupted Blood during Effect',
            min: null,
            max: null,
          },
        ],
      },
    ];

    expect(
      searchPairs(
        actions,
        [
          '18% increased Charge Recovery',
          '43% less Duration',
          'Immunity to Bleeding and Corrupted Blood during Effect',
        ],
        {
          strict: false,
        },
      ),
    ).toHaveLength(1);
  });

  it('Не целые значения', () => {
    const actions: CraftRule[] = [
      {
        id: 1,
        action: 'ready',
        additional: {},
        mods: [
          {
            value: '# of Spell Damage Leeched as Energy Shield during Effect',
            min: null,
            max: null,
          },
        ],
      },
    ];

    expect(
      searchPairs(actions, ['0.5% of Spell Damage Leeched as Energy Shield during Effect'], {
        strict: false,
      }),
    ).toHaveLength(1);
  });
});
