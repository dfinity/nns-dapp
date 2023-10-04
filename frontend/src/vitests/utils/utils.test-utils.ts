import { assertNonNullish as dfinityAssertNonNullish } from "@dfinity/utils";
import { fireEvent } from "@testing-library/dom";

export const silentConsoleErrors = () =>
  vi.spyOn(console, "error").mockReturnValue();

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
