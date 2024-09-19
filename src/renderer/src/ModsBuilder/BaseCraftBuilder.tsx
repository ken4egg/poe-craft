import {
  ActionIcon,
  Autocomplete,
  Fieldset,
  Grid,
  NumberInput,
  SegmentedControl,
  Tooltip,
} from '@mantine/core';
import { IconTrashX } from '@tabler/icons-react';
import * as React from 'react';
import css from '../app.module.css';
import { actions } from './actions';
import { useFormContext } from './context';

export const BaseCraftBuilder = React.memo(() => {
  const form = useFormContext();

  return form.getValues().rules.map((item, index) => (
    <Fieldset legend={`Условие ${index + 1}`} key={item.id} pos="relative">
      <Tooltip label="Удалить условие">
        <ActionIcon
          variant="subtle"
          className={css.kbd}
          color="gray"
          onClick={() => {
            form.removeListItem('rules', index);
          }}
        >
          <IconTrashX style={{ width: '70%', height: '70%' }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>

      <Fieldset legend="Если" variant="unstyled">
        <ModificatorList index={index} />
      </Fieldset>

      <Fieldset legend="Тогда" variant="unstyled" mt="md">
        <Grid>
          <Grid.Col span={6}>
            <SegmentedControl
              {...form.getInputProps(`rules.${index}.action`)}
              key={form.key(`rules.${index}.action`)}
              data={actions}
            />
          </Grid.Col>
        </Grid>
      </Fieldset>
    </Fieldset>
  ));
});

BaseCraftBuilder.displayName = 'BaseCraftBuilder';

const ModificatorRow = React.memo<{ index: number; modIndex: number }>(({ index, modIndex }) => {
  const form = useFormContext();

  const data = React.useMemo(() => {
    const values = form.getValues();

    return [
      { group: 'Префикс', items: values.prefixes },
      { group: 'Суффикс', items: values.suffixes },
    ];
  }, [form]);

  return (
    <Grid>
      <Grid.Col span={8}>
        <Autocomplete
          {...form.getInputProps(`rules.${index}.mods.${modIndex}.value`)}
          key={form.key(`rules.${index}.mods.${modIndex}.value`)}
          label="Модификатор"
          placeholder="Любой"
          data={data}
        />
      </Grid.Col>

      <Grid.Col span={2}>
        <NumberInput
          {...form.getInputProps(`rules.${index}.mods.${modIndex}.min`)}
          key={form.key(`rules.${index}.mods.${modIndex}.min`)}
          placeholder="MIN"
          label="мин"
        />
      </Grid.Col>

      <Grid.Col span={2}>
        <NumberInput
          {...form.getInputProps(`rules.${index}.mods.${modIndex}.max`)}
          key={form.key(`rules.${index}.mods.${modIndex}.max`)}
          placeholder="MAX"
          label="макс"
        />
      </Grid.Col>
    </Grid>
  );
});

const ModificatorList = React.memo(({ index }: { index: number }) => {
  return (
    <>
      <ModificatorRow index={index} modIndex={0} />
      <ModificatorRow index={index} modIndex={1} />
      <ModificatorRow index={index} modIndex={2} />
      <ModificatorRow index={index} modIndex={3} />
    </>
  );
});

ModificatorList.displayName = 'ModificatorList';

ModificatorRow.displayName = 'ModificatorRow';
