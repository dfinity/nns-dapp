import { ICPToken, TokenAmount } from "@dfinity/nns";
import { assertNonNullish as dfinityAssertNonNullish } from "@dfinity/utils";
import { fireEvent } from "@testing-library/dom";

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

// The token is not relevant here as we only aim to parse the string and gets its bigint value. That's why we can use ICPToken regardless.
export const amountFromString = (amount: string): bigint =>
  (
    TokenAmount.fromString({
      amount,
      token: ICPToken,
    }) as TokenAmount
  ).toE8s();
