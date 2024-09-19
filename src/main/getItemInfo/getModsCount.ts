import { searchReplacerRegex } from '../utils';

const templates = [
  'chance to Poison on Hit',
  'Minions have # increased Attack Speed',
  '# increased Light Radius',
  '# increased effect',
  '#% chance to Avoid being Frozen during Effect',
  'less Duration',
  '#% reduced Freeze Duration on you during Effect',
  'Shock and Ignite during Effect',
];

export const getModCount = (mods: string[]) => {
  let count = mods.length;

  if (mods.some((item) => templates.includes(item.replaceAll(searchReplacerRegex, '#')))) {
    count -= 1;
  }

  return count;
};
