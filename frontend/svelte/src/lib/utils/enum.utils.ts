export const enumValues = <T>(obj: T): number[] => {
  return Object.values(obj).filter((o: T) => typeof o === "number");
};

export const enumKeys = <T>(obj: T): string[] => {
  return Object.values(obj).filter((o: T) => typeof o === "string");
};

// TODO(L2-206): Happy to get help here to type the enum.
// If set to "T" TypeScript throw following error: Type 'typeof Topic' is not assignable to type 'Topic'
export const enumsKeys = <T>({
  obj,
  values,
}: {
  obj: unknown;
  values: T[];
}): string[] => {
  return values.map((value: T) => obj[value as unknown as string]);
};
