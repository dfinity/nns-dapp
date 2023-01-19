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
import { enterAmount } from "../../../utils/neurons-modal.test-utils";

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
    const renderResult = await renderTransactionModal();

    await enterAmount(renderResult);

    const { getByTestId } = renderResult;

    const confirmButton = getByTestId("transaction-button-execute");
    fireEvent.click(confirmButton);

    await waitFor(() => expect(stakeNeuron).toBeCalled());
  });
});
