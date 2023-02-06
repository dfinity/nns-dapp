import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

export const testTransferTokens = async ({
  getByTestId,
  container,
  queryAllByText,
}: RenderResult<SvelteComponent>) => {
  await waitFor(() =>
    expect(getByTestId("transaction-step-1")).toBeInTheDocument()
  );
  const participateButton = getByTestId("transaction-button-next");
  expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

  // Enter amount
  const amount = "10";
  const input = container.querySelector("input[name='amount']");
  input && fireEvent.input(input, { target: { value: amount } });

  // Enter valid destination address
  const addressInput = container.querySelector(
    "input[name='accounts-address']"
  );
  addressInput &&
    fireEvent.input(addressInput, { target: { value: "aaaaa-aa" } });
  await waitFor(() =>
    expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
  );

  fireEvent.click(participateButton);

  await waitFor(() => expect(getByTestId("transaction-step-2")).toBeTruthy());
  expect(queryAllByText(amount, { exact: false }).length).toBeGreaterThan(0);

  const confirmButton = getByTestId("transaction-button-execute");
  fireEvent.click(confirmButton);
};
