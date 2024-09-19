import {
  Cords,
  Currency,
  LogMessage,
  CraftStatus,
  CraftRule,
  CraftInstance,
} from '../shared/interface';

export interface ApiEvents<T> {
  ['settings:change:delay']: (event: T, payload: number) => void;
  ['settings:change:rules']: (event: T, payload: { name: string; rules: CraftRule[] }) => void;
  ['settings:change:currency']: (event: T, payload: Record<Currency, Cords | null>) => void;
  ['craft:update']: (event: T, payload: CraftInstance[]) => void;
  ['craft:pref-suf-update']: (
    event: T,
    payload: { prefixes: string[]; suffixes: string[] },
  ) => void;
  ['craft:init']: (event: T, payload: { name: string }) => void;
  ['state:update']: (event: T, payload: { status: CraftStatus }) => void;
  ['log:message']: (event: T, payload: LogMessage) => void;
  ['currency:listener:on']: (event: T, payload: { currency: Currency; key: string }[]) => void;
}
