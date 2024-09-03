import {
  assertNonNullish as dfinityAssertNonNullish,
  nonNullish,
} from "@dfinity/utils";
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

/**
 * vitest considers an element visible if it has height: 0px.
 *
 * Therefore, we try to check the height of the element to find out whether we consider it not visible.
 */
export const isNotVisible = (element: Element): boolean => {
  try {
    expect(element).not.toBeVisible();
    return false;
  } catch (_) {
    const styles = element.getAttribute("style");
    const heightString = styles?.match(/height: (\d+)px/)?.[1];
    return nonNullish(heightString) && Number(heightString) === 0;
  }
};
