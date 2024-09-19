import { ActionIcon, Avatar, Flex, Group, Kbd, Text, Tooltip } from '@mantine/core';
import * as React from 'react';
import { getCurrencyObject } from '../../shared/getCurrencyObject';
import { Cords, Currency } from '../../shared/interface';
import ExaltedOrbIconSrc from './assets/Exalted_Orb.webp';
import AlchemyOrbIconSrc from './assets/Orb_of_Alchemy.webp';
import AlterationOrbIconSrc from './assets/Orb_of_Alteration.webp';
import AugmentationIconSrc from './assets/Orb_of_Augmentation.webp';
import RegalOrbIconSrc from './assets/Orb_of_Regal.webp';
import ScouringOrbIconSrc from './assets/Orb_of_Scouring.webp';
import TransmutationOrbIconSrc from './assets/Orb_of_Transmutation.webp';
import ScrollOfWisdomIconSrc from './assets/Scroll_of_Wisdom.webp';
import VaalOrbIconSrc from './assets/Vaal_Orb.webp';
import ChaosOrbIconSrc from './assets/Chaos_Orb.webp';

const srcPathMap: Record<Currency, string> = {
  'Scroll of Wisdom': ScrollOfWisdomIconSrc,
  'Orb of Augmentation': AugmentationIconSrc,
  'Chaos Orb': ChaosOrbIconSrc,
  'Vaal Orb': VaalOrbIconSrc,
  'Orb of Regal': RegalOrbIconSrc,
  'Orb of Alchemy': AlchemyOrbIconSrc,
  'Orb of Alteration': AlterationOrbIconSrc,
  'Orb of Scouring': ScouringOrbIconSrc,
  'Orb of Transmutation': TransmutationOrbIconSrc,
  'Exalted Orb': ExaltedOrbIconSrc,
};

interface CurrencyPositionSetterProps {
  currency: Currency | Currency[];
  requiredCurrency: Currency[];
}

const keyBinding = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];

export const CurrencyPositionSetter = ({
  currency,
  requiredCurrency,
}: CurrencyPositionSetterProps) => {
  if (currency.length > keyBinding.length) {
    throw new Error('too much orbs');
  }

  const [currencyState, setCurrencyState] = React.useState(getCurrencyObject<Cords | null>(null));

  const array = React.useMemo(
    () =>
      Array.isArray(currency)
        ? currency.map((c, index) => ({
            currency: c,
            key: keyBinding[index],
          }))
        : [{ currency, key: keyBinding[0] }],
    [currency],
  );

  React.useEffect(() => {
    window.api.send('currency:listener:on', array);
  }, [array]);

  React.useEffect(() => {
    return window.api.on('settings:change:currency', (_, payload) => {
      setCurrencyState(payload);
    });
  }, []);

  return (
    <>
      {array.map((c) => {
        const currentCurrency = currencyState[c.currency];

        const getColor = () => {
          if (currentCurrency !== null) {
            return 'green';
          }

          return requiredCurrency.includes(c.currency) ? 'red' : 'gray';
        };

        return (
          <Group gap="xs" key={c.currency}>
            <Tooltip label={c.currency}>
              <ActionIcon variant="outline" size="xl" color={getColor()}>
                <Avatar src={srcPathMap[c.currency]} size="sm" />
              </ActionIcon>
            </Tooltip>

            <Flex direction="column">
              <Text fz="xs">
                {currentCurrency === null
                  ? 'Нет'
                  : `x: ${currentCurrency.x} y: ${currentCurrency.y}`}
              </Text>
              <span>
                <Kbd>Shift</Kbd> + <Kbd> {c.key}</Kbd>
              </span>
            </Flex>
          </Group>
        );
      })}
    </>
  );
};
