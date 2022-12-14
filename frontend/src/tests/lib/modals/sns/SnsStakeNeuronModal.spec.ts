/**
 * @jest-environment jsdom
 */

import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";
import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
import SnsStakeNeuronModal from "$lib/modals/sns/neurons/SnsStakeNeuronModal.svelte";
import { stakeNeuron } from "$lib/services/sns-neurons.services";
import { authStore } from "$lib/stores/auth.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { page } from "$mocks/$app/stores";
import { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { fireEvent, waitFor } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "../../../mocks/auth.store.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { mockSnsAccountsStoreSubscribe } from "../../../mocks/sns-accounts.mock";
import { mockSnsSelectedTransactionFeeStoreSubscribe } from "../../../mocks/transaction-fee.mock";

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    stakeNeuron: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("SnsStakeNeuronModal", () => {
  const token = { name: "SNS", symbol: "SNS" };
  const renderTransactionModal = () =>
    renderModal({
      component: SnsStakeNeuronModal,
      props: {
        token,
        transactionFee: TokenAmount.fromE8s({
          amount: BigInt(10_000),
          token,
        }),
        rootCanisterId: mockPrincipal,
        governanceCanisterId: mockPrincipal,
      },
    });

  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  beforeEach(() => {
    jest
      .spyOn(snsAccountsStore, "subscribe")
      .mockImplementation(mockSnsAccountsStoreSubscribe(mockPrincipal));
    jest
      .spyOn(snsSelectedTransactionFeeStore, "subscribe")
      .mockImplementation(mockSnsSelectedTransactionFeeStoreSubscribe());
    jest
      .spyOn(snsProjectIdSelectedStore, "subscribe")
      .mockImplementation((run: Subscriber<Principal>): (() => void) => {
        run(mockPrincipal);
        return () => undefined;
      });

    page.mock({ data: { universe: mockPrincipal.toText() } });
  });

  it("should stake a new sns neuron", async () => {
    const { queryAllByText, getByTestId, container } =
      await renderTransactionModal();

    await waitFor(() =>
      expect(getByTestId("transaction-step-1")).toBeInTheDocument()
    );
    const participateButton = getByTestId("transaction-button-next");
    expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

    // Enter amount
    const icpAmount = "10";
    const input = container.querySelector("input[name='amount']");
    input && fireEvent.input(input, { target: { value: icpAmount } });
    await waitFor(() =>
      expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
    );

    fireEvent.click(participateButton);

    await waitFor(() => expect(getByTestId("transaction-step-2")).toBeTruthy());
    expect(queryAllByText(icpAmount, { exact: false }).length).toBeGreaterThan(
      0
    );

    const confirmButton = getByTestId("transaction-button-execute");
    fireEvent.click(confirmButton);

    await waitFor(() => expect(stakeNeuron).toBeCalled());
  });
});
