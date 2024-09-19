import { getModCount } from './getModsCount';

interface ItemInfo {
  class: string;
  rarity: 'Normal' | 'Magic' | 'Rare' | 'Unique' | 'UNKNOWN';
  modifiers: string[];
  // кол-во модификаторов
  modifiersCount: number;
  unidentified: boolean;
  map: {
    t17: boolean;
    quantity?: number;
    rarity?: number;
    packSize?: number;
    moreMaps?: number;
    moreScarabs?: number;
    moreCurrency?: number;
  };
  special: {
    synthesised: boolean;
    corrupted: boolean;
    mirrored: boolean;
  };
}

const itemClassRegex = /Item Class: (.*)/;
const rarityRegex = /Rarity: (.*)/;

const mapQuantityRegex = /Item Quantity: \+(\d+)% \(augmented\)/;
const mapRarityRegex = /Item Rarity: \+(\d+)% \(augmented\)/;
const mapPackSizeRegex = /Monster Pack Size: \+(\d+)% \(augmented\)/;
const mapMoreMapsRegex = /More Maps: \+(\d+)% \(augmented\)/;
const mapMoreScarabsRegex = /More Scarabs: \+(\d+)% \(augmented\)/;
const mapMoreCurrencyRegex = /More Currency: \+(\d+)% \(augmented\)/;

const exceptionMods = ['Searing Exarch Item', 'Eater of Worlds Item'];
const delimiter = process.platform === 'darwin' ? '\n' : '\r\n';

export const getItemInfo = (text: string): ItemInfo => {
  const lines = text.split(delimiter);

  const rarity = text.match(rarityRegex)?.[1];
  const itemClass = text.match(itemClassRegex)?.[1];

  if (!itemClass) {
    throw new Error('Wrong item');
  }

  const result: ItemInfo = {
    class: itemClass,
    rarity: isRarityExisted(rarity) ? rarity : 'UNKNOWN',
    modifiers: [],
    modifiersCount: 0,
    unidentified: false,
    map: {
      t17: false,
    },
    special: {
      synthesised: false,
      corrupted: false,
      mirrored: false,
    },
  };

  let isEnabled = getDefaultEnabledByClass(result.class);

  let skip = 0;

  if (result.rarity !== 'Normal') {
    for (let i = lines.length - 1; i > 0; i--) {
      const line = lines[i];

      if (!line || line === '') {
        continue;
      }

      if (line === 'Unidentified') {
        result.unidentified = true;
        break;
      }

      if (line?.startsWith('Note:')) {
        isEnabled = false;
        continue;
      }

      switch (line) {
        case 'Modifiable only with Chaos Orbs, Vaal Orbs, Delirium Orbs and Chisels': {
          skip++;
          result.map.t17 = true;
          isEnabled = false;
          continue;
        }

        case 'Synthesised Item': {
          skip++;
          isEnabled = false;
          result.special.synthesised = true;
          continue;
        }
        case 'Corrupted': {
          skip++;
          isEnabled = false;
          result.special.corrupted = true;
          continue;
        }
        case 'Mirrored': {
          skip++;
          isEnabled = false;
          result.special.mirrored = true;
          continue;
        }
      }

      if (line === '--------') {
        if (isEnabled) {
          break;
        } else {
          skip === 0 ? (isEnabled = true) : skip--;

          continue;
        }
      }

      if (isEnabled && line && !exceptionMods.includes(line)) {
        result.modifiers.push(line);
      }
    }
  }

  if (result.class === 'Maps') {
    result.map.quantity = getNumberFromRegex(text, mapQuantityRegex);
    result.map.rarity = getNumberFromRegex(text, mapRarityRegex);
    result.map.packSize = getNumberFromRegex(text, mapPackSizeRegex);
    result.map.moreMaps = getNumberFromRegex(text, mapMoreMapsRegex);
    result.map.moreScarabs = getNumberFromRegex(text, mapMoreScarabsRegex);
    result.map.moreCurrency = getNumberFromRegex(text, mapMoreCurrencyRegex);
  }

  result.modifiers.reverse();

  result.modifiersCount = getModCount(result.modifiers);

  return result;
};

const getNumberFromRegex = (text: string, regEx: RegExp): number | undefined => {
  const result = text.match(regEx)?.[1];

  return result ? parseInt(result) : void 0;
};

// У колец (возможно у чего-то еще, нужно дополнять) модификаторы идут сразу без описания
const getDefaultEnabledByClass = (itemClass: string) => {
  switch (itemClass) {
    case 'Rings': {
      return true;
    }

    default:
      return false;
  }
};

const isRarityExisted = (o: unknown): o is ItemInfo['rarity'] => {
  switch (o) {
    case 'Normal':
    case 'Magic':
    case 'Rare':
    case 'Unique':
      return true;

    default:
      return false;
  }
};
