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
