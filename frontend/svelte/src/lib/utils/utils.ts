export const debounce = (func: Function, timeout?: number) => {
  let timer: NodeJS.Timer | undefined;

  return (...args: any[]) => {
    const next = () => func(...args);

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(next, timeout && timeout > 0 ? timeout : 300);
  };
};

/**
 * Transform bigint to string to avoid serialization error.
 */
export const stringifyJson = ({
  value,
  indentation = 2,
}: {
  value: object;
  indentation?: number;
}): string => {
  return JSON.stringify(
    value,
    (key, value) => (typeof value === "bigint" ? value.toString() : value),
    indentation
  );
};
