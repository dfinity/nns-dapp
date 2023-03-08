import type { TransactionNetwork } from "$lib/types/transaction";
import { nonNullish } from "@dfinity/utils";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

const amount = "10";

export const testTransferReviewTokens = async ({
  result: { getByTestId, container },
  selectedNetwork = undefined,
  destinationAddress = "aaaaa-aa",
}: {
  result: RenderResult<SvelteComponent>;
  selectedNetwork?: TransactionNetwork;
  destinationAddress?: string;
}) => {
  await waitFor(() =>
    expect(getByTestId("transaction-step-1")).toBeInTheDocument()
  );
  const participateButton = getByTestId("transaction-button-next");
  expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

  // Enter amount
  const input = container.querySelector("input[name='amount']");
  input && fireEvent.input(input, { target: { value: amount } });

  // Enter valid destination address
  const addressInput = container.querySelector(
    "input[name='accounts-address']"
  );
  addressInput &&
    fireEvent.input(addressInput, { target: { value: destinationAddress } });

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
};

export const testTransferTokens = async ({
  result,
  selectedNetwork = undefined,
  destinationAddress = "aaaaa-aa",
}: {
  result: RenderResult<SvelteComponent>;
  selectedNetwork?: TransactionNetwork;
  destinationAddress?: string;
}) => {
  const { getByTestId, queryAllByText } = result;

  await testTransferReviewTokens({
    result,
    selectedNetwork,
    destinationAddress,
  });

  await waitFor(() => expect(getByTestId("transaction-step-2")).toBeTruthy());
  expect(queryAllByText(amount, { exact: false }).length).toBeGreaterThan(0);

  const confirmButton = getByTestId("transaction-button-execute");
  fireEvent.click(confirmButton);
};
