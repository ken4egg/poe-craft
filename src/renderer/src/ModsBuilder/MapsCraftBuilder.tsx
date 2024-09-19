import { Checkbox, Fieldset, Flex, NumberInput, Table } from '@mantine/core';
import * as React from 'react';
import { useFormContext } from './context';

const index = 0;

export const MapsCraftBuilder = React.memo(() => {
  const form = useFormContext();

  const mods = form.getValues()?.rules[0]?.mods ?? [];

  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (form.getValues().rules.length === 0) {
        form.insertListItem('rules', {
          id: Date.now(),
          action: 'ready',
          additional: {
            quantity: void 0,
            rarity: void 0,
            packSize: void 0,
            moreMaps: void 0,
            moreScarabs: void 0,
            moreCurrency: void 0,
          },
          mods: [{ value: event.target.value, min: null, max: null }],
        });
      } else {
        form.setFieldValue(
          'rules.0.mods',
          event.target.checked
            ? [
                ...form.getValues().rules[index].mods,
                { value: event.target.value, min: null, max: null },
              ]
            : form.getValues().rules[index].mods.filter((x) => x.value !== event.target.value),
        );
      }
    },
    [form],
  );

  return (
    <div>
      <Fieldset legend="t16" pos="relative">
        <Flex gap="md">
          <NumberInput
            {...form.getInputProps(`rules.${index}.additional.quantity`)}
            key={form.key(`rules.${index}.additional.quantity`)}
            label="Item Quantity"
            clampBehavior="strict"
            min={0}
          />
          <NumberInput
            {...form.getInputProps(`rules.${index}.additional.rarity`)}
            key={form.key(`rules.${index}.additional.rarity`)}
            label="Item Rarity"
            clampBehavior="strict"
            min={0}
          />
          <NumberInput
            {...form.getInputProps(`rules.${index}.additional.packSize`)}
            key={form.key(`rules.${index}.additional.packSize`)}
            label="Monster Pack Size"
            clampBehavior="strict"
            min={0}
          />
        </Flex>
        <Flex gap="md">
          <NumberInput
            {...form.getInputProps(`rules.${index}.additional.moreMaps`)}
            key={form.key(`rules.${index}.additional.moreMaps`)}
            label="More Maps"
            clampBehavior="strict"
            min={0}
          />
          <NumberInput
            {...form.getInputProps(`rules.${index}.additional.moreScarabs`)}
            key={form.key(`rules.${index}.additional.moreScarabs`)}
            label="More Scarabs"
            clampBehavior="strict"
            min={0}
          />
          <NumberInput
            {...form.getInputProps(`rules.${index}.additional.moreCurrency`)}
            key={form.key(`rules.${index}.additional.moreCurrency`)}
            label="More Currency"
            clampBehavior="strict"
            min={0}
          />
        </Flex>

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>Модификатор</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {form.values.suffixes.map((element) => (
              <Table.Tr
                key={element}
                // bg={
                //   selectedRows.includes(element.position) ? 'var(--mantine-color-blue-light)' : undefined
                // }
              >
                <Table.Td>
                  <Checkbox
                    color="red"
                    value={element}
                    checked={Boolean(mods.find((item) => item.value === element))}
                    onChange={onChange}
                  />
                </Table.Td>
                <Table.Td>{element}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Fieldset>
      <Fieldset legend="t17" pos="relative">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>Модификатор</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {form.values.prefixes.map((element) => (
              <Table.Tr
                key={element}
                // bg={
                //   selectedRows.includes(element.position) ? 'var(--mantine-color-blue-light)' : undefined
                // }
              >
                <Table.Td>
                  <Checkbox
                    color="red"
                    value={element}
                    checked={Boolean(mods.find((item) => item.value === element))}
                    onChange={onChange}
                  />
                </Table.Td>
                <Table.Td>{element}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Fieldset>
    </div>
  );
});

MapsCraftBuilder.displayName = 'MapsCraftBuilder';
