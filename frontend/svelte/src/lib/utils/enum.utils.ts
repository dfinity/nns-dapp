export const enumValues = <T>(obj: T): number[] => {
  return Object.values(obj).filter((o: T) => typeof o === "number");
};

export const enumKeys = <T>(obj: T): string[] => {
  return Object.values(obj).filter((o: T) => typeof o === "string");
};

// TODO: Happy to get help to replace following "any". Generic enums are pain.
export const enumsKeys = <T>({
  obj,
  values,
}: {
  obj: any;
  values: T[];
}): string[] => {
  return values.map((value: T) => obj[value as unknown as string]);
};
