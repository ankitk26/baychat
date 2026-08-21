/** Runtime environment probe that works in both browser and SSR contexts. */
export const isBrowser = (): boolean => globalThis.window !== undefined;
