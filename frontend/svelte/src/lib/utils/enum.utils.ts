export const enumValues = <T>(obj: T): number[] => {
  return Object.values(obj).filter((o: T) => typeof o === "number");
};

export const enumKeys = <T>(obj: T): string[] => {
  return Object.values(obj).filter((o: T) => typeof o === "string");
};

export const enumsKeys = <T>({
  obj,
  values,
}: {
  obj: T;
  values: T[];
}): string[] => {
  return values.map((value: T) => obj[value as unknown as string]);
};
