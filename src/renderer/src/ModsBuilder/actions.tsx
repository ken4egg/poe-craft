import { Center, Image, Tooltip, rem } from '@mantine/core';
import { IconThumbUp } from '@tabler/icons-react';
import { CraftRule } from 'src/shared/interface';
import ExaltedOrbIconSrc from '../assets/Exalted_Orb.webp';
import AugmentationOrbIconSrc from '../assets/Orb_of_Augmentation.webp';
import RegalOrbIconSrc from '../assets/Orb_of_Regal.webp';
import VaalOrbIconSrc from '../assets/Vaal_Orb.webp';

export const actions: { value: CraftRule['action']; label: React.ReactNode }[] = [
  {
    value: 'ready',
    label: (
      <Center style={{ gap: 10 }}>
        <IconThumbUp style={{ width: rem(18), height: rem(18) }} />
        <span>Готово</span>
      </Center>
    ),
  },
  {
    value: 'Orb of Augmentation',
    label: (
      <Center style={{ gap: 10 }}>
        <Tooltip label="Orb of Augmentation">
          <Image src={AugmentationOrbIconSrc} h={22} w={22} />
        </Tooltip>
      </Center>
    ),
  },
  {
    value: 'Orb of Regal',
    label: (
      <Center style={{ gap: 10 }}>
        <Tooltip label="Regal Orb">
          <Image src={RegalOrbIconSrc} h={22} w={22} />
        </Tooltip>
      </Center>
    ),
  },
  {
    value: 'Exalted Orb',
    label: (
      <Center style={{ gap: 10 }}>
        <Tooltip label="Exalted Orb">
          <Image src={ExaltedOrbIconSrc} h={22} w={22} />
        </Tooltip>
      </Center>
    ),
  },
  {
    value: 'Vaal Orb',
    label: (
      <Center style={{ gap: 10 }}>
        <Tooltip label="Vaal Orb">
          <Image src={VaalOrbIconSrc} h={22} w={22} />
        </Tooltip>
      </Center>
    ),
  },
];
