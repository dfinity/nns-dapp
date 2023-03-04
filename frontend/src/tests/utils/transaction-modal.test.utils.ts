import type { TransactionNetwork } from "$lib/types/transaction";
import { nonNullish } from "@dfinity/utils";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

export const testTransferTokens = async ({
  result: { getByTestId, container, queryAllByText },
  selectedNetwork = undefined,
}: {
  result: RenderResult<SvelteComponent>;
  selectedNetwork?: TransactionNetwork;
}) => {
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

  if (nonNullish(selectedNetwork)) {
    const selectElement = getByTestId(
      "select-network-dropdown"
    ) as HTMLSelectElement | null;
    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: selectedNetwork },
      });
  }
  await waitFor(() =>
    expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
  );

  fireEvent.click(participateButton);

  await waitFor(() => expect(getByTestId("transaction-step-2")).toBeTruthy());
  expect(queryAllByText(amount, { exact: false }).length).toBeGreaterThan(0);

  const confirmButton = getByTestId("transaction-button-execute");
  fireEvent.click(confirmButton);
};
