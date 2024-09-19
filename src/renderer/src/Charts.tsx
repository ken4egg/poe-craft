import { BarChart } from '@mantine/charts';
import { Avatar, Group, Text } from '@mantine/core';
import * as React from 'react';
import { CraftInstance } from 'src/shared/interface';
import { callArray } from './utils/callArray';
import AlterationOrbIconSrc from './assets/Orb_of_Alteration.webp';
import AugmentationIconSrc from './assets/Orb_of_Augmentation.webp';

const total = { aug: 0, alt: 0, time: 0 };

export const Charts = React.memo(() => {
  const [instances, setInstances] = React.useState<CraftInstance[]>([]);

  React.useEffect(() => {
    const unsubscribeFromCraftUpdate = window.api.on('craft:update', (_, payload) => {
      setInstances(payload);
    });

    const unsubscribeFromCraftInit = window.api.on('craft:init', () => {
      setInstances([]);
    });

    return callArray([unsubscribeFromCraftUpdate, unsubscribeFromCraftInit]);
  }, []);

  const formattedData = React.useMemo(() => {
    total.alt = 0;
    total.aug = 0;
    total.time = 0;

    return instances.map((item, index) => {
      const time = Math.floor(
        item.times.reduce<number>((acc, current) => {
          const diff = current.end - current.start;
          acc += diff;
          return acc;
        }, 0) / 60000,
      );

      total.aug += item.currencyCount['Orb of Augmentation'];
      total.alt += item.currencyCount['Orb of Alteration'];
      total.time += time;
      return {
        name: `#${index + 1}`,
        aug: item.currencyCount['Orb of Augmentation'],
        alt: item.currencyCount['Orb of Alteration'],
        time,
      };
    });
  }, [instances]);

  // const allData = React.useMemo(() => {
  //   return jewels.reduce<number>((acc, current) => {
  //     const time = current.times.reduce((a, current) => {
  //       const diff = current.end - current.start;
  //       return a + diff;
  //     }, 0);

  //     return acc + time;
  //   }, 0);
  // }, [jewels]);

  return (
    <div>
      <BarChart
        h={150}
        data={formattedData}
        dataKey="name"
        withLegend
        type="stacked"
        series={[
          { name: 'alt', label: 'Orb of Alteration', color: 'blue.2' },
          { name: 'aug', label: 'Orb of Augmentation', color: 'blue.9' },
          { name: 'time', label: 'Время (мин)', color: 'yellow' },
        ]}
      />
      <Group>
        <Text>Общее время: {total.time} мин</Text>

        <Group gap="xs">
          <Avatar src={AlterationOrbIconSrc} size="sm" />- {total.alt}
        </Group>
        <Group gap="xs">
          <Avatar src={AugmentationIconSrc} size="sm" />- {total.aug}
        </Group>
      </Group>
    </div>
  );
});

Charts.displayName = 'Charts';

// function msToString(millis: number) {
//   const minutes = Math.floor(millis / 60000);
//   const seconds = ((millis % 60000) / 1000).toFixed(0);
//   return `${minutes} мин ${seconds} сек`;
// }
