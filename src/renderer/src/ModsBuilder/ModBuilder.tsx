import { Button, Group, Indicator, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import * as React from 'react';
import css from '../app.module.css';
import { BaseCraftBuilder } from './BaseCraftBuilder';
import { FormProvider, FormValuesType, useForm } from './context';
import { MapsCraftBuilder } from './MapsCraftBuilder';

const initialValues: FormValuesType = {
  rules: [],
  prefixes: [],
  suffixes: [],
};

const builderMap = {
  Maps: <MapsCraftBuilder />,
  Flasks: <BaseCraftBuilder />,
};

export const ModBuilder = React.memo<{ operatingMod: string }>(({ operatingMod }) => {
  const [opened, { open, close }] = useDisclosure(false);

  const ref = React.useRef<HTMLDivElement>(null);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues,
  });

  // const [data, setData] = React.useState<{
  //   prefixes: string[];
  //   suffixes: string[];
  // }>({ prefixes: [], suffixes: [] });

  React.useEffect(() => {
    return window.api.on('craft:pref-suf-update', (_, payload) => {
      form.setFieldValue('prefixes', payload.prefixes);
      form.setFieldValue('suffixes', payload.suffixes);
    });
  }, [form]);

  React.useEffect(() => {
    return window.api.on('settings:change:rules', (_, payload) => {
      const values = form.getValues();

      form.setInitialValues({
        rules: payload.rules,
        prefixes: values.prefixes,
        suffixes: values.suffixes,
      });
      form.reset();
    });
  }, [form]);

  const scrollToBottom = () => ref.current?.scrollIntoView({ behavior: 'instant' });

  const handleSubmit = React.useCallback(
    (values: typeof form.values) => {
      window.api.send('settings:change:rules', { name: operatingMod, rules: values.rules });
      close();
    },
    [close, form, operatingMod],
  );

  return (
    <FormProvider form={form}>
      <Modal opened={opened} onClose={close} title={`Правила крафта - ${operatingMod}`} fullScreen>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          {builderMap[operatingMod]}

          <div ref={ref} />

          <Group justify="space-between" className={css.modalFooter}>
            {operatingMod !== 'Maps' && (
              <Button
                variant="subtle"
                onClick={() => {
                  form.insertListItem('rules', {
                    id: Date.now(),
                    action: 'ready',
                    mods: [
                      { value: '', min: null, max: null },
                      { value: '', min: null, max: null },
                      { value: '', min: null, max: null },
                      { value: '', min: null, max: null },
                    ],
                  });
                  setTimeout(scrollToBottom);
                }}
              >
                Добавить новое условие
              </Button>
            )}
            <Group>
              <Button variant="outline">Импорт</Button>
              <Button variant="outline">Экспорт</Button>
              <Button type="submit">Сохранить</Button>
            </Group>
          </Group>
        </form>
      </Modal>

      <Indicator inline label={form.getValues().rules.length} size={16}>
        <Button onClick={open} variant="gradient">
          Редактировать правила
        </Button>
      </Indicator>
    </FormProvider>
  );
});

ModBuilder.displayName = 'ModBuilder';
