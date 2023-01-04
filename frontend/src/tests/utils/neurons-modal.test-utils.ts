import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

export const selectPercentage = async (
  renderResult: RenderResult<SvelteComponent>
) => {
  const { queryByTestId } = renderResult;
  const rangeElement = queryByTestId("input-range");
  expect(rangeElement).toBeInTheDocument();
  rangeElement &&
    (await fireEvent.input(rangeElement, { target: { value: 50 } }));

  const selectMaturityButton = queryByTestId(
    "select-maturity-percentage-button"
  );
  expect(selectMaturityButton).toBeInTheDocument();
  selectMaturityButton && (await fireEvent.click(selectMaturityButton));
};

export const AMOUNT_INPUT_SELECTOR = "input[name='amount']";

export const enterAmount = async (
  renderResult: RenderResult<SvelteComponent>
) => {
  const { queryAllByText, getByTestId, container } = renderResult;

  await waitFor(() =>
    expect(getByTestId("transaction-step-1")).toBeInTheDocument()
  );
  const nextButton = getByTestId("transaction-button-next");
  expect(nextButton?.hasAttribute("disabled")).toBeTruthy();

  // Enter amount
  const icpAmount = "10";
  const input = container.querySelector(AMOUNT_INPUT_SELECTOR);
  input && fireEvent.input(input, { target: { value: icpAmount } });
  await waitFor(() => expect(nextButton?.hasAttribute("disabled")).toBeFalsy());

  fireEvent.click(nextButton);

  await waitFor(() => expect(getByTestId("transaction-step-2")).toBeTruthy());
  expect(queryAllByText(icpAmount, { exact: false }).length).toBeGreaterThan(0);
};
