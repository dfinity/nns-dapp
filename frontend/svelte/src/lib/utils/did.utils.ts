// These utils are duplicated in nns-js and sns-js, we might want to create a utility lib someday
// We do not expose the utility in these libraries for that reason

export const toNullable = <T>(value?: T): [] | [T] => {
  return value !== undefined ? [value] : [];
};

export const fromNullable = <T>(value: [] | [T]): T | undefined => {
  return value?.[0];
};
