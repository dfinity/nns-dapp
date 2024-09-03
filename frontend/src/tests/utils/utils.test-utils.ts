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

// Return a promise-like object that exposes its resolve and reject functions.
export const createDeferredPromise = <T>(): Promise<T> & {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
} => {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve,
    reject,
    then: (onFulfilled, onRejected) => promise.then(onFulfilled, onRejected),
    catch: (onRejected) => promise.catch(onRejected),
    finally: (onFinally) => promise.finally(onFinally),
  } as Promise<T> & {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason?: unknown) => void;
  };
};
