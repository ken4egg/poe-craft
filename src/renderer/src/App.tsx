import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Fieldset,
  Flex,
  Group,
  Kbd,
  Radio,
  ScrollArea,
  Slider,
  Text,
} from '@mantine/core';
import { callArray } from '@renderer/utils/callArray';
import {
  IconAlertTriangle,
  IconExclamationMark,
  IconInfoCircle,
  IconTrash,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import * as React from 'react';
import { CraftStatus, Currency, LogMessage } from '../../shared/interface';
import { CurrencyPositionSetter } from './CurrencyPositionSetter';
import { Charts } from './Charts';
import { ModBuilder } from './ModsBuilder/ModBuilder';
import css from './app.module.css';

const DELAY_OPTIONS = [
  { value: 300, label: '300ms' },
  { value: 1000, label: '1s' },
  { value: 1500, label: '1.5s' },
  { value: 2500, label: '2.5s' },
];

const operatingMods = [
  {
    name: 'Flasks',
    description: 'Крафт особых флаконов (зеленые)',
  },
  { name: 'Maps', description: 'Крафт нужных модификаторов карт' },
];

const defaultRequiredCurrency: Currency[] = [
  'Orb of Alteration',
  'Orb of Augmentation',
  'Orb of Transmutation',
  'Chaos Orb',
  'Orb of Alchemy',
  'Orb of Scouring',
  'Scroll of Wisdom',
];

function App(): JSX.Element {
  const viewportRef = React.useRef<HTMLDivElement>(null);

  const [messages, setMessages] = React.useState<LogMessage[]>([]);
  const [delay, setDelay] = React.useState<number>(500);
  const [state, setState] = React.useState<{ status: CraftStatus }>({ status: 'IDLE' });
  const [operatingMod, setOperatingMod] = React.useState<string>();

  const [requiredCurrency, setRequiredCurrency] =
    React.useState<Currency[]>(defaultRequiredCurrency);

  React.useEffect(() => {
    return window.api.on('settings:change:rules', (_, payload) => {
      const currencySet = payload.rules.reduce<Set<Currency>>((acc, current) => {
        if (current.action !== 'ready') {
          acc.add(current.action);
        }

        return acc;
      }, new Set<Currency>());

      if (currencySet.has('Orb of Regal')) {
        currencySet.add('Orb of Scouring');
        currencySet.add('Orb of Transmutation');
      }

      setRequiredCurrency([...defaultRequiredCurrency, ...currencySet]);
    });
  }, []);

  React.useEffect(() => {
    if (operatingMod) {
      window.api.send('craft:init', { name: operatingMod });
    }
  }, [operatingMod]);

  React.useEffect(() => {
    const unsubscribeFromStateUpdate = window.api.on('state:update', (_, updatedState) => {
      setState(updatedState);
    });

    const unsubscribeFromLogMessage = window.api.on('log:message', (_, message) => {
      setMessages((current) => [...current, { ...message, date: new Date() }]);
    });

    const unsubscribeFromDelay = window.api.on('settings:change:delay', (_, value) => {
      setDelay(value);
    });

    const unsubscribeFromCraftInit = window.api.on('craft:init', (_, value) => {
      setOperatingMod(value.name);
    });

    return callArray([
      unsubscribeFromStateUpdate,
      unsubscribeFromLogMessage,
      unsubscribeFromDelay,
      unsubscribeFromCraftInit,
    ]);
  }, []);

  const changeDelay = React.useCallback((value: number) => {
    setDelay(value);
    window.api.send('settings:change:delay', value);
  }, []);

  const scrollToBottom = () => viewportRef.current?.scrollIntoView({ behavior: 'instant' });

  const clearLogMessages = React.useCallback(() => {
    setMessages([]);
  }, []);

  React.useEffect(() => {
    if (messages.length > 1000) {
      clearLogMessages();
    }
    scrollToBottom();
  }, [clearLogMessages, messages]);

  const [logLevels, setLogLevels] = React.useState(['INFO', 'WARNING', 'ERROR']);

  return (
    <section className={css.mainSection}>
      <Fieldset
        pos="relative"
        legend={
          <>
            Статус
            <span className={css.kbd}>
              <Kbd>Insert</Kbd>
            </span>
          </>
        }
      >
        {state.status}

        <Radio.Group
          value={operatingMod}
          onChange={setOperatingMod}
          label="Режим крафта"
          description="Выберите один из доступных режимов крафта"
        >
          <Flex pt="md" gap="md">
            {operatingMods.map((item) => (
              <Radio.Card className={css.root} radius="md" value={item.name} key={item.name}>
                <Group wrap="nowrap" align="flex-start">
                  <Radio.Indicator />
                  <div>
                    <Text className={css.label}>{item.name}</Text>
                    <Text className={css.description}>{item.description}</Text>
                  </div>
                </Group>
              </Radio.Card>
            ))}
          </Flex>
        </Radio.Group>
      </Fieldset>

      <Fieldset
        pos="relative"
        legend={
          <>
            Статистика и очередь крафта
            <span className={css.kbd}>
              <Kbd>Shift</Kbd> + <Kbd>ЛКМ</Kbd>
            </span>
          </>
        }
      >
        <Charts />
      </Fieldset>
      <Fieldset legend="Настройки">
        <Checkbox.Group value={logLevels} onChange={setLogLevels}>
          <Text fz={14}>Уровень логов</Text>
          <Group mt="xs">
            <Checkbox value="INFO" label="Info" color={getColor({ type: 'INFO' })} />
            <Checkbox value="WARNING" label="Warning" color={getColor({ type: 'WARNING' })} />
            <Checkbox value="ERROR" label="Error" color={getColor({ type: 'ERROR' })} />
            <Flex flex={1} />

            <Button
              variant="subtle"
              onClick={clearLogMessages}
              rightSection={<IconTrash size={16} />}
            >
              Очистить
            </Button>
          </Group>
        </Checkbox.Group>
        <Divider my="md" />
        <Text fz={14}>Задержка</Text>
        <Slider
          pb="md"
          color="blue"
          value={delay}
          min={50}
          max={3000}
          onChange={changeDelay}
          marks={DELAY_OPTIONS}
        />
        <Divider my="lg" />

        <Group justify="space-between">
          {operatingMod && <ModBuilder operatingMod={operatingMod} />}
          <Group>
            <CurrencyPositionSetter
              currency={requiredCurrency}
              requiredCurrency={defaultRequiredCurrency}
            />
          </Group>
        </Group>
      </Fieldset>
      <Fieldset legend="Лог" style={{ overflow: 'hidden' }}>
        <ScrollArea h="100%">
          {logLevels.length > 0 &&
            messages
              .filter((item) => logLevels.includes(item.type))
              .map((item, index) => (
                <Alert
                  key={index}
                  variant="outline"
                  my={5}
                  title={item.label}
                  color={getColor(item)}
                  icon={getIcon(item)}
                >
                  <Text fz={14} className={css.modsMessage}>
                    {item.message}
                  </Text>

                  {item.date && (
                    <Text c="dimmed" fz={12} className={css.timeDescription}>
                      {dayjs(item.date).format('HH:mm:ss')}
                    </Text>
                  )}
                </Alert>
              ))}
          <div ref={viewportRef} />
        </ScrollArea>
      </Fieldset>
    </section>
  );
}

export default App;

function getColor(message: Pick<LogMessage, 'type'>) {
  switch (message.type) {
    case 'ERROR':
      return 'red';

    case 'WARNING':
      return 'yellow';

    case 'INFO':
    default:
      return 'blue';
  }
}

function getIcon(message: Pick<LogMessage, 'type'>) {
  switch (message.type) {
    case 'ERROR':
      return <IconExclamationMark />;

    case 'WARNING':
      return <IconAlertTriangle />;

    case 'INFO':
    default:
      return <IconInfoCircle />;
  }
}
