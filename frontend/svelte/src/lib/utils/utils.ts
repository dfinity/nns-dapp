/* eslint-disable-next-line @typescript-eslint/ban-types */
export const debounce = (func: Function, timeout?: number) => {
  let timer: NodeJS.Timer | undefined;

  return (...args: unknown[]) => {
    const next = () => func(...args);

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(
      next,
      timeout !== undefined && timeout > 0 ? timeout : 300
    );
  };
};

/**
 * Transform bigint to string to avoid serialization error.
 * devMode transforms 123n -> "BigInt(123)"
 */
export const stringifyJson = (
  value: unknown,
  options?: {
    indentation?: number;
    devMode?: boolean;
  }
): string =>
  JSON.stringify(
    value,
    (_, value) =>
      typeof value === "bigint"
        ? options?.devMode !== undefined && options.devMode
          ? `BigInt('${value.toString()}')`
          : value.toString()
        : value,
    options?.indentation ?? 0
  );

/**
 * Returns only uniq elements of the list (uses JSON.stringify for comparation)
 */
export const uniqueObjects = <T>(list: T[]): T[] => {
  const uniqHashes = new Set<string>();
  const result: T[] = [];
  for (const item of list) {
    const hash = stringifyJson(item);
    if (!uniqHashes.has(hash)) {
      uniqHashes.add(hash);
      result.push(item);
    }
  }
  return result;
};

// https://stackoverflow.com/questions/43010737/way-to-tell-typescript-compiler-array-prototype-filter-removes-certain-types-fro#answer-54318054
export const isDefined = <T>(argument: T | undefined): argument is T =>
  argument !== undefined;

export const targetBlankLinkRenderer = (
  href: string | null,
  title: string | null,
  text: string
): string =>
  `<a${
    href === null
      ? ""
      : ` target="_blank" rel="noopener noreferrer" href="${href}"`
  }${title === null ? "" : ` title="${title}"`}>${text}</a>`;

/**
 * Returns an array of arrays of size <= `chunkSize`
 */
export const createChunks = <T>(
  elements: Array<T>,
  chunkSize = 10
): Array<Array<T>> => {
  const chunks: Array<Array<T>> = [];
  for (let i = 0; i < elements.length; i += chunkSize) {
    const chunk = elements.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  return chunks;
};
