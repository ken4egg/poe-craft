import { BaseCraft, BaseCraftOptions } from './BaseCraft';
import { ClipboardTimeoutError } from './ClipboardService';
import { getItemInfo } from './getItemInfo/getItemInfo';
import { searchPairs } from './searchPairs';

export class UtilFlaskCraft extends BaseCraft {
  constructor(props: BaseCraftOptions) {
    super(props);
  }

  public work = async () => {
    await this.goToCurrentCraftCoords();

    await this.wait();

    await this.pressKeysToCopyItemText();
    this.clipboard
      .readItemText()
      .then(async (itemText) => {
        const itemInfo = getItemInfo(itemText);

        this.logger?.({
          message: `${itemInfo.modifiers.join('\n')}`,
          type: 'INFO',
          label: 'processing mods',
        });

        if (itemInfo.special.corrupted) {
          this.logger?.({
            message: `${itemInfo.modifiers.join('\n')}`,
            type: 'ERROR',
            label: 'corrupted item, skip',
          });

          return this.finishCurrent();
        }

        if (itemInfo.rarity === 'Normal') {
          this.logger?.({ message: 'Item is normal rarity', type: 'INFO' });

          await this.useOrb('Orb of Transmutation');

          return this.next();
        }

        /** Если всего 1 мод, делает не строгий поиск */
        const resultList = searchPairs(this.craftRules.rules, itemInfo.modifiers, {
          strict: itemInfo.modifiersCount !== 1,
        });

        const result = resultList[0];

        const isOnlyOneRequired =
          result?.mods.filter((item) => item.value !== '').length === 1 &&
          itemInfo.modifiersCount === 1;

        if ((result?.action === 'ready' && itemInfo.modifiersCount > 1) || isOnlyOneRequired) {
          this.logger?.({
            message: `Ready!`,
            type: 'INFO',
          });

          return this.finishCurrent();
        }

        if (
          (result?.action === 'ready' && itemInfo.modifiersCount === 1) ||
          result?.action === 'Orb of Augmentation'
        ) {
          this.logger?.({ message: '1 mod is good, use augmentation', type: 'INFO' });

          await this.useOrb('Orb of Augmentation');

          return this.next();
        }

        if (result?.action && result.action !== 'ready') {
          this.logger?.({ message: result.action, type: 'INFO', label: 'Orb' });
          await this.useOrb(result.action);

          return this.next();
        }

        await this.useOrb('Orb of Alteration');
        return this.next();
      })
      .catch((e) => {
        if (e instanceof ClipboardTimeoutError) {
          this.logger?.({ message: e.message, type: 'WARNING' });
        } else if (e instanceof Error) {
          return this.logger?.({ message: e.message, type: 'ERROR' });
        }

        return this.next();
      });
  };

  prefixes: string[] = [
    '#% chance to gain a Flask Charge when you deal a Critical Strike',
    '#% increased Charge Recovery',
    '#% increased Duration',
    '#% reduced Charges per use',
    '#% reduced Duration',
    '#% increased effect',
    '+# to Maximum Charges',
    'Gain # Charges when you are Hit by an Enemy',
  ];

  suffixes: string[] = [
    '#% additional Elemental Resistances during Effect',
    '#% chance to Avoid being Chilled during Effect',
    '#% chance to Avoid being Frozen during Effect',
    '#% chance to Avoid being Ignited during Effect',
    '#% chance to Avoid being Shocked during Effect',
    '#% Chance to Avoid being Stunned during Effect',
    '#% chance to Freeze',
    'Shock and Ignite during Effect',
    '#% increased Armour during Effect',
    '#% increased Block and Stun Recovery during Effect',
    '#% increased Critical Strike Chance during Effect',
    '#% increased Evasion Rating during Effect',
    '#% increased Movement Speed during Effect',
    '#% of Attack Damage Leeched as Life during Effect',
    '#% of Spell Damage Leeched as Energy Shield during Effect',
    '#% reduced Effect of Chill on you during Effect',
    '#% reduced Freeze Duration on you during Effect',
    '#% reduced Effect of Curses on you during Effect',
    '#% reduced Effect of Shock on you during Effect',
    'Immunity to Bleeding and Corrupted Blood during Effect',
    '#% less Duration',
    'Immunity to Freeze and Chill during Effect',
    'Immunity to Ignite during Effect, Removes Burning on use',
    'Immunity to Poison during Effect',
    'Immunity to Shock during Effect',
    '(20-30)% increased Rarity of Items found during Effect',
    '15% of Damage Taken from Hits is Leeched as Life during Effect',
    '(60-80)% reduced Reflected Damage taken during Effect',
    'Regenerate 3% of Life per second during Effect',
  ];
}
