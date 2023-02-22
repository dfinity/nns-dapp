/**
 * Return the values of a number-based Enum
 *
 * e.g. enum Hello { World = 0; } => [0]
 */
export const enumValues = <T extends Record<string, unknown>>(
  obj: T
): number[] => {
  return Object.values(obj).filter(
    (o: unknown) => typeof o === "number"
  ) as number[];
};

/**
 * Return the keys of a number-based Enum
 *
 * e.g. enum Hello { World = 0; } => ['World']
 */
export const enumKeys = <T extends Record<string, unknown>>(
  obj: T
): string[] => {
  return Object.values(obj).filter(
    (o: unknown) => typeof o === "string"
  ) as string[];
};

/**
 * Return the keys of a subset of a number-based Enum
 *
 * e.g. enum Hello { A = 0; B = 1; C = 2; } with subset [Hello.A, Hello.B] => ['A', 'B']
 */
export const enumsKeys = <T>({
  obj,
  values,
}: {
  obj: T;
  values: T[];
}): string[] => {
  return values.map(
    (value: T) => obj[value as unknown as keyof T]
  ) as unknown as string[];
};

/**
 * Return the enums not included in a subset of a number-based Enum
 *
 * e.g. enum Hello { A = 0; B = 1; C = 2; } with subset [Hello.A, Hello.B] => [Hello.C]
 */
export const enumsExclude = <T>({
  obj,
  values,
}: {
  obj: T;
  values: T[];
}): T[] => {
  const keys: string[] = enumsKeys<T>({
    obj,
    values,
  });

  return enumKeys(obj as Record<string, unknown>)
    .filter((key: string) => !keys.includes(key))
    .map((key: string) => obj[key as keyof T] as unknown as T);
};

/**
 * Return the length of an enum - i.e. the number of values
 *
 * e.g. enum Hello { A = 0; B = 1; C = 2; } => 3
 */
export const enumSize = <T extends Record<string, unknown>>(enm: T): number => {
  return Object.values(enm).filter((value) => isNaN(value as number)).length;
};
