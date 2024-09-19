import { BaseCraft, BaseCraftOptions } from './BaseCraft';
import { ClipboardTimeoutError } from './ClipboardService';
import { getItemInfo } from './getItemInfo/getItemInfo';
import { searchPairs } from './searchPairs';

export class MapCraft extends BaseCraft {
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

        const resultList = searchPairs(this.craftRules.rules, itemInfo.modifiers, {
          strict: false,
        });

        const isAdditionalGood = () => {
          let result = true;
          const additional = this.craftRules.rules[0]?.additional;

          if (additional) {
            Object.keys(additional).forEach((key) => {
              if (
                typeof additional[key] === 'number' &&
                itemInfo.map[key] &&
                itemInfo.map[key] < additional[key]
              ) {
                result = false;
              }
            });
          }

          return result;
        };

        // В случае крафта мап, любое совпадение является отрицательным результатом
        if (resultList.length > 0 || !isAdditionalGood()) {
          if (itemInfo.map.t17) {
            await this.useOrb('Chaos Orb');
            return this.next();
          } else {
            await this.useOrb('Orb of Scouring');
            await this.wait();
            await this.useOrb('Orb of Alchemy');
            return this.next();
          }
        } else {
          this.logger?.({
            message: `Ready!`,
            type: 'INFO',
          });
          return this.finishCurrent();
        }
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
  // t17
  prefixes: string[] = [
    '#% increased Monster Movement Speed #% increased Monster Attack Speed #% increased Monster Cast Speed',
    '#% increased Monster Damage',
    '#% increased number of Rare Monsters Rare Monsters each have 2 additional Modifiers',
    '#% more Monster Life',
    '+#% Monster Physical Damage Reduction +#% Monster Chaos Resistance +#% Monster Elemental Resistances',
    "#% of Damage Players' Totems take from Hits is taken from their Summoner's Life instead",
    '#% chance for Rare Monsters to Fracture on death',
    'All Monster Damage can Ignite, Freeze and Shock Monsters Ignite, Freeze and Shock on Hit',
    'Area contains Drowning Orbs',
    'Area contains Petrification Statues',
    'Area contains Runes of the Searing Exarch',
    'Area contains Unstable Tentacle Fiends',
    "Area has patches of Awakeners' Desolation",
    'Buffs on Players expire #% faster',
    'Debuffs on Monsters expire #% faster',
    'Map Boss is accompanied by a Synthesis Boss',
    'Monster Damage Penetrates #% Elemental Resistances',
    "Monsters Poison on Hit All Damage from Monsters' Hits can Poison Monsters have #% increased Poison Duration",
    "Monsters cannot be Stunned Monsters' Action Speed cannot be modified to below Base Value Monsters' Movement Speed cannot be modified to below Base Value",
    'Monsters gain #% of their Physical Damage as Extra Damage of a random Element',
    'Monsters gain #% of Maximum Life as Extra Maximum Energy Shield',
    'Monsters gain #% of their Physical Damage as Extra Chaos Damage',
    'Monsters have #% increased Critical Strike Chance +#% to Monster Critical Strike Multiplier',
    'Monsters have +1 to Maximum Endurance Charges Monsters gain an Endurance Charge when hit',
    'Monsters have +1 to Maximum Frenzy Charges Monsters gain a Frenzy Charge on Hit',
    'Monsters have +1 to Maximum Power Charges Monsters gain a Power Charge on Hit',
    'Monsters have +#% chance to Suppress Spell Damage',
    'Monsters have +#% Chance to Block Attack Damage',
    'Monsters have #% increased Area of Effect Monsters fire 2 additional Projectiles',
    'Monsters inflict 2 Grasping Vines on Hit',
    'Monsters reflect #% of Physical Damage Monsters reflect #% of Elemental Damage',
    'Monsters take #% reduced Extra Damage from Critical Strikes',
    "Monsters' Attacks Impale on Hit When a fifth Impale is inflicted on a Player, Impales are removed to Reflect their Physical Damage multiplied by their remaining Hits to that Player and their Allies within 1.8 metres",
    "Monsters' skills Chain 3 additional times Monsters' Projectiles can Chain when colliding with Terrain",
    'Player Skills which Throw Mines throw 1 fewer Mine Player Skills which Throw Traps throw 1 fewer Trap',
    'Players and their Minions deal no damage for 3 out of every 10 seconds',
    'Players are Cursed with Vulnerability Players are Cursed with Temporal Chains Players are Cursed with Elemental Weakness',
    'Players are Marked for Death for 10 seconds after killing a Rare or Unique monster',
    'Players are assaulted by Bloodstained Sawblades',
    'Players are targeted by a Meteor when they use a Flask',
    'Players have #% less Area of Effect',
    'Players have #% less Defences',
    'Players have #% reduced Maximum total Life, Mana and Energy Shield Recovery per second from Leech',
    'Players have -#% to all maximum Resistances',
    "Players have #% reduced Action Speed for each time they've used a Skill Recently",
    "Players' Minions have #% less Attack Speed Players' Minions have #% less Cast Speed Players' Minions have #% less Movement Speed",
    'Rare Monsters have Volatile Cores',
    'Rare and Unique Monsters remove #% of Life, Mana and Energy Shield from Players or their Minions on Hit',
    'Rare monsters in area are Shaper-Touched',
    'The Maven interferes with Players',
    'Unique Bosses are Possessed',
    'Unique Monsters have a random Shrine Buff',
  ];
  // t16
  suffixes: string[] = [
    'Monsters reflect #% of Elemental Damage',
    'Monsters reflect #% of Physical Damage',
    'Players have #% reduced effect of Non-Curse Auras from Skills',
    'Players have (-12--9)% to all maximum Resistances',
    'Players cannot Regenerate Life, Mana or Energy Shield',
    'Players have #% less Recovery Rate of Life and Energy Shield',
    'Monsters cannot be Leeched from',
    'Monsters have #% increased Critical Strike Chance +#% to Monster Critical Strike Multiplier',
    'Monsters deal #% extra Physical Damage as Cold',
    'Monsters deal #% extra Physical Damage as Fire',
    'Monsters deal #% extra Physical Damage as Lightning',
    'Monsters gain #% of their Physical Damage as Extra Chaos Damage Monsters Inflict Withered for 2 seconds on Hit',
    'Monsters fire 2 additional Projectiles',
    '#% increased Monster Movement Speed #% increased Monster Attack Speed #% increased Monster Cast Speed',
    'Unique Boss deals #% increased Damage Unique Boss has #% increased Attack and Cast Speed',
    'Monsters have #% increased Area of Effect',
    'Unique Boss has #% increased Life Unique Boss has #% increased Area of Effect',
    'Monsters Poison on Hit',
    'Monsters have a #% chance to avoid Poison, Impale, and Bleeding',
    "Monsters' skills Chain 2 additional times",
    '#% increased Monster Damage',
    'Monsters have #% increased Accuracy Rating Players have -#% to amount of Suppressed Spell Damage Prevented',
    '#% less effect of Curses on Monsters',
    'Players are Cursed with Elemental Weakness',
    'Players are Cursed with Enfeeble',
    'Players are Cursed with Temporal Chains',
    'Players are Cursed with Vulnerability',
    'Area has patches of Burning Ground',
    'Area has patches of Chilled Ground',
    'Area has patches of Consecrated Ground',
    'Area has patches of Shocked Ground which increase Damage taken by #%',
    'Area has patches of desecrated ground',
    'Players have #% less Armour Players have #% reduced Chance to Block',
    'Monsters have +#% chance to Suppress Spell Damage',
    'Monsters take #% reduced Extra Damage from Critical Strikes',
    'Monsters gain #% of Maximum Life as Extra Maximum Energy Shield',
    'Players gain #% reduced Flask Charges',
    '+#% Monster Physical Damage Reduction',
    'Monsters are Hexproof',
    'Monsters have #% chance to Avoid Elemental Ailments',
    'Players cannot inflict Exposure',
    '#% more Monster Life Monsters cannot be Stunned',
    '#% more Monster Life',
    '+#% Monster Chaos Resistance +#% Monster Elemental Resistances',
    'All Monster Damage from Hits always Ignites',
    'Monsters have a #% chance to Ignite, Freeze and Shock on Hit',
    "Monsters' Attacks have #% chance to Impale on Hit",
    'Buffs on Players expire #% faster',
    'Players have #% less Cooldown Recovery Rate',
    'Area contains two Unique Bosses',
    'Unique Bosses are Possessed',
    "Monsters cannot be Taunted Monsters' Action Speed cannot be modified to below Base Value Monsters' Movement Speed cannot be modified to below Base Value",
    'Players have #% less Accuracy Rating',
    'Monsters gain a Frenzy Charge on Hit',
    'Monsters gain a Power Charge on Hit',
    'Monsters gain an Endurance Charge on Hit',
    'Monsters steal Power, Frenzy and Endurance charges on Hit',
    'Players have #% less Area of Effect',
    'Monsters Blind on Hit',
    'Monsters Hinder on Hit with Spells',
    'Monsters Maim on Hit with Attacks',
    'Area contains many Totems',
    'Area has increased monster variety',
    'Area is inhabited by Abominations',
    'Area is inhabited by Animals',
    'Area is inhabited by Cultists of Kitava',
    'Area is inhabited by Demons',
    'Area is inhabited by Ghosts',
    'Area is inhabited by Goatmen',
    'Area is inhabited by Humanoids',
    'Area is inhabited by Lunaris fanatics',
    'Area is inhabited by Sea Witches and their Spawn',
    'Area is inhabited by Skeletons',
    'Area is inhabited by Solaris fanatics',
    'Area is inhabited by Undead',
    'Area is inhabited by ranged monsters',
    '#% increased number of Rare Monsters',
    '#% increased Magic Monsters',
  ];
}
