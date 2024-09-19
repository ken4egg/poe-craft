import { describe, expect, it } from '@jest/globals';
import { getItemInfo } from './getItemInfo';
import fs from 'fs';
import path from 'path';

const getFileSync = (s: string) =>
  fs.readFileSync(path.join(__dirname, `./snapshots/${s}.txt`), 'utf-8');

const ring1 = getFileSync('ring-1');
const ring2 = getFileSync('ring-2');
const ringUndefined = getFileSync('ring-undefined');
const body = getFileSync('body-1');
const gloves = getFileSync('gloves-1');
const belt = getFileSync('belt-1');
const utilFlask = getFileSync('flask-util-1');
const cluster = getFileSync('cluster-1');
const syntJewel = getFileSync('synt-base-jewel-1');
const t16 = getFileSync('map-t16');
const t17 = getFileSync('map-t17');
const abyssNormalJewel = getFileSync('abyss-normal-jewel');
const corrMirrAbyssJewel = getFileSync('mirr-corr-abyss-jewel-1');

describe('Базовый функционал ф-ии', () => {
  it('Должен возвращать ошибку при неправильном предмете', () => {
    expect(() => getItemInfo('asdasd')).toThrow('Wrong item');
  });

  it('Должен возвращать класс предмета', () => {
    expect(getItemInfo(ring1).class).toBe('Rings');
    expect(getItemInfo(ring2).class).toBe('Rings');
    expect(getItemInfo(ringUndefined).class).toBe('Rings');
    expect(getItemInfo(body).class).toBe('Body Armours');
    expect(getItemInfo(gloves).class).toBe('Gloves');
    expect(getItemInfo(belt).class).toBe('Belts');
    expect(getItemInfo(utilFlask).class).toBe('Utility Flasks');
    expect(getItemInfo(cluster).class).toBe('Jewels');
    expect(getItemInfo(syntJewel).class).toBe('Jewels');
    expect(getItemInfo(corrMirrAbyssJewel).class).toBe('Abyss Jewels');
    expect(getItemInfo(t16).class).toBe('Maps');
    expect(getItemInfo(t17).class).toBe('Maps');
  });

  it('Должен модификаторы предметов', () => {
    expect(getItemInfo(ring1).modifiers).toEqual([
      '+13 to maximum Energy Shield',
      'Regenerate 1.2 Life per second',
      '+45% to Fire Resistance',
      'Minions deal 32% increased Damage',
    ]);

    expect(getItemInfo(body).modifiers).toEqual([
      '+30% chance to Suppress Spell Damage',
      '+41 to Dexterity',
      '143% increased Evasion Rating',
      '25% increased Chill Duration on Enemies',
      '115 to 196 Added Cold Damage with Bow Attacks',
    ]);

    expect(getItemInfo(gloves).modifiers).toEqual([
      '+32% to Chaos Resistance (fractured)',
      '+13% chance to Suppress Spell Damage',
      '+59 to Dexterity',
      '+27 to Evasion Rating',
      '+105 to maximum Life',
      '43% increased Damage while Leeching (crafted)',
    ]);

    expect(getItemInfo(belt).modifiers).toEqual([
      '+49 to Strength',
      '+62 to Dexterity',
      '+56 to maximum Life',
      '23% increased Damage with Hits against Rare monsters',
      'When you Kill a Rare monster, you gain its Modifiers for 60 seconds',
    ]);

    expect(getItemInfo(utilFlask).modifiers).toEqual([
      '28% reduced Duration',
      '25% increased effect',
      '59% increased Evasion Rating during Effect',
    ]);

    expect(getItemInfo(cluster).modifiers).toEqual([
      'Added Small Passive Skills also grant: +3% to Chaos Resistance',
      'Added Small Passive Skills also grant: Minions Regenerate 0.1% of Life per Second',
      '1 Added Passive Skill is Life from Death',
    ]);

    expect(getItemInfo(syntJewel).modifiers).toEqual([
      '+8 to Dexterity and Intelligence',
      '+6% to Physical Damage over Time Multiplier',
      '14% increased Damage with One Handed Weapons',
    ]);

    expect(getItemInfo(corrMirrAbyssJewel).modifiers).toEqual([
      'Adds 1 to 3 Physical Damage to Attacks',
      '+185 to Accuracy Rating',
      '2% increased Cooldown Recovery Rate',
    ]);

    expect(getItemInfo(t16).modifiers).toEqual([
      'Area contains many Totems',
      'Players cannot inflict Exposure',
      'Monsters Poison on Hit',
      'Area contains two Unique Bosses',
      'Unique Bosses are Possessed',
      'Monsters gain 40% of Maximum Life as Extra Maximum Energy Shield',
      'Players gain 50% reduced Flask Charges',
      'Players have 60% less Recovery Rate of Life and Energy Shield',
    ]);

    expect(getItemInfo(t17).modifiers).toEqual([
      'Players are Cursed with Enfeeble',
      'Monsters have 660% increased Critical Strike Chance',
      '+73% to Monster Critical Strike Multiplier',
      '+50% Monster Physical Damage Reduction',
      'All Monster Damage can Ignite, Freeze and Shock',
      '+35% Monster Chaos Resistance',
      '+55% Monster Elemental Resistances',
      'Monsters have +50% Chance to Block Attack Damage',
      'Monsters Maim on Hit with Attacks',
      'Monsters Ignite, Freeze and Shock on Hit',
    ]);
  });

  it('Если предмет не раскрыт, то вернет пустые значения и флаг unidentified', () => {
    expect(getItemInfo(ringUndefined).modifiers).toEqual([]);
    expect(getItemInfo(ringUndefined).modifiers).toEqual([]);
  });

  it('Должен возвращать редкость предмета', () => {
    expect(getItemInfo(ring1).rarity).toBe('Rare');
    expect(getItemInfo(ring2).rarity).toBe('Magic');
    expect(getItemInfo(ringUndefined).rarity).toBe('Rare');
    expect(getItemInfo(body).rarity).toBe('Unique');
    expect(getItemInfo(gloves).rarity).toBe('Rare');
    expect(getItemInfo(belt).rarity).toBe('Unique');
    expect(getItemInfo(utilFlask).rarity).toBe('Magic');
    expect(getItemInfo(cluster).rarity).toBe('Rare');
    expect(getItemInfo(syntJewel).rarity).toBe('Rare');
    expect(getItemInfo(corrMirrAbyssJewel).rarity).toBe('Rare');
  });

  it('Если предмет обычного качества, то вернет пустые значения и качество normal', () => {
    expect(getItemInfo(abyssNormalJewel).modifiers).toEqual([]);
    expect(getItemInfo(abyssNormalJewel).rarity).toBe('Normal');
  });

  it('Должен корректно считать кол-во модификаторов, некоторые пишутся в 2 строки', () => {
    expect(getItemInfo(ring2).modifiers).toEqual([
      '11% increased Global Accuracy Rating',
      '5% increased Light Radius',
    ]);
    expect(getItemInfo(ring2).modifiersCount).toBe(1);

    expect(getItemInfo(utilFlask).modifiers).toEqual([
      '28% reduced Duration',
      '25% increased effect',
      '59% increased Evasion Rating during Effect',
    ]);

    expect(getItemInfo(utilFlask).modifiersCount).toBe(2);
  });

  it('Должен корректно возвращать модификатор t17', () => {
    expect(getItemInfo(t17).map.t17).toEqual(true);
    expect(getItemInfo(t16).map.t17).toEqual(false);
  });

  it('Должен корректно возвращать модификатор Quantity', () => {
    expect(getItemInfo(t16).map.quantity).toEqual(113);
    expect(getItemInfo(t17).map.quantity).toEqual(123);
  });

  it('Должен корректно возвращать модификатор Rarity', () => {
    expect(getItemInfo(t16).map.rarity).toEqual(66);
    expect(getItemInfo(t17).map.rarity).toEqual(103);
  });

  it('Должен корректно возвращать модификатор Monster Pack Size', () => {
    expect(getItemInfo(t16).map.packSize).toEqual(43);
    expect(getItemInfo(t17).map.packSize).toEqual(35);
  });

  it('Должен корректно возвращать модификатор More Maps', () => {
    expect(getItemInfo(t16).map.moreMaps).toEqual(void 0);
    expect(getItemInfo(t17).map.moreMaps).toEqual(50);
  });

  it('Должен корректно возвращать модификатор More Scarabs', () => {
    expect(getItemInfo(t16).map.moreScarabs).toEqual(void 0);
    expect(getItemInfo(t17).map.moreScarabs).toEqual(90);
  });

  it('Должен корректно возвращать модификатор More Currency', () => {
    expect(getItemInfo(t16).map.moreCurrency).toEqual(void 0);
    expect(getItemInfo(t17).map.moreCurrency).toEqual(70);
  });
});
