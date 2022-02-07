export const enumValues = <T>(obj: T): number[] => {
  return Object.values(obj).filter((o: T) => typeof o === "number");
};

export const enumKeys = <T>(obj: T): string[] => {
  return Object.values(obj).filter((o: T) => typeof o === "string");
};
