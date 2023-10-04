import { assertNonNullish as dfinityAssertNonNullish } from "@dfinity/utils";
import { fireEvent } from "@testing-library/dom";

/**
 * TODO: delete module once migration to vitest over
 * @deprecated module was copied to frontend/src/vitests/utils/utils.test-utils.ts
 */

export const silentConsoleErrors = () =>
  jest.spyOn(console, "error").mockImplementation(jest.fn);

export const clickByTestId = async (
  queryByTestId: (matcher: string) => HTMLElement | null,
  testId: string
) => {
  const element = queryByTestId(testId);
  expect(element).toBeInTheDocument();

  element && fireEvent.click(element);
};

export const normalizeWhitespace = (
  text: string | undefined
): string | undefined => text && text.replace(/\s+/g, " ");

export const assertNonNullish = <T>(
  value: T,
  message?: string
): NonNullable<T> => {
  dfinityAssertNonNullish(value, message);
  return value;
};
