/**
 * Return the values of a number-based Enum
 *
 * e.g. enum Hello { World = 0; } => [0]
 */
export const enumValues = <T>(obj: T): number[] => {
  return Object.values(obj).filter((o: T) => typeof o === "number");
};

/**
 * Return the keys of a number-based Enum
 *
 * e.g. enum Hello { World = 0; } => ['World']
 */
export const enumKeys = <T>(obj: T): string[] => {
  return Object.values(obj).filter((o: T) => typeof o === "string");
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
  return values.map((value: T) => obj[value as unknown as string]);
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

  return enumKeys(obj)
    .filter((key: string) => !keys.includes(key))
    .map((key: string) => obj[key]);
};

/**
 * Return the length of an enum - i.e. the number of values
 *
 * e.g. enum Hello { A = 0; B = 1; C = 2; } => 3
 */
export const enumSize = <T>(enm: T): number => {
  return Object.values(enm).filter(isNaN).length;
};
