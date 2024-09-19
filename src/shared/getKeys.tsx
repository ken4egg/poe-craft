export function getKeys<O extends Record<string, unknown>>(o: O): Array<keyof O> {
  return Object.keys(o) as Array<keyof O>;
}
