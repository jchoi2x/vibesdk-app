export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj } as Record<string, unknown>;
  for (const key of keys) {
    delete result[key as string];
  }
  return result as Omit<T, K>;
}

export function deepMerge<T extends object>(
  target: T,
  ...sources: Partial<T>[]
): T {
  const result = { ...target } as unknown as Record<string, unknown>;
  for (const source of sources) {
    for (const [key, val] of Object.entries(source)) {
      if (val === undefined) continue;
      const existing = result[key];
      if (isPlainObject(existing) && isPlainObject(val)) {
        result[key] = deepMerge(existing, val as Partial<typeof existing>);
      } else {
        result[key] = val;
      }
    }
  }
  return result as T;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return (
    typeof v === 'object' &&
    v !== null &&
    Object.getPrototypeOf(v) === Object.prototype
  );
}
