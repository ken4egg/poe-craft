/* eslint-disable no-unexpected-multiline */
import { CraftRule } from '../shared/interface';
import { searchReplacerRegex } from './utils';

interface SearchPairsOptions {
  strict: boolean;
}

export function searchPairs(
  data: CraftRule[],
  searchArray: string[],
  options?: SearchPairsOptions,
): CraftRule[] {
  const isStrict = options?.strict ?? true;
  // Если данные не нормализованы заранее
  //   const normalizedData = data.map((item) => ({
  //     ...item,
  //     mods: item.mods.map((x) => ({
  //       ...x,
  //       value: x.value.replace(searchReplacerRegex, '#'),
  //     })),
  //   }));

  const normalizedSearchArray = searchArray.map((x) => {
    const matchesArray = Array.from(x.matchAll(searchReplacerRegex));

    const result = matchesArray.reduce<{ value: number[]; template: string; noValue: boolean }>(
      (accumulator, current) => {
        if (accumulator.template === '') {
          accumulator.template = current.input;
        }

        accumulator.value.push(parseInt(current[0]));
        accumulator.template = accumulator.template.replace(current[0], '#');

        return accumulator;
      },
      { value: [], template: x, noValue: matchesArray.length == 0 },
    );

    return result;
  });

  const result = data.filter((item) => {
    return item.mods
      .filter((x) => x.value !== '')
      [isStrict ? 'every' : 'some']((o) => {
        const existedMod = normalizedSearchArray.find((x) => x.template === o.value);
        if (existedMod) {
          if (existedMod.noValue) {
            return true;
          }

          const value = existedMod.value.length > 1 ? existedMod.value[1] : existedMod.value[0];

          if (typeof value === 'undefined') {
            return false;
          }

          if (o.min !== null && value < o.min) {
            return false;
          }
          if (o.max !== null && value > o.max) {
            return false;
          }

          return true;
        }

        return false;
      });
  });

  return result;
}
