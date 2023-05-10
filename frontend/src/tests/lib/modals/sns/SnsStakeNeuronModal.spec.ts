import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
import SnsStakeNeuronModal from "$lib/modals/sns/neurons/SnsStakeNeuronModal.svelte";
import { stakeNeuron } from "$lib/services/sns-neurons.services";
import { authStore } from "$lib/stores/auth.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { page } from "$mocks/$app/stores";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockSnsAccountsStoreSubscribe } from "$tests/mocks/sns-accounts.mock";
import { snsNervousSystemParametersMock } from "$tests/mocks/sns-neurons.mock";
import { mockSnsSelectedTransactionFeeStoreSubscribe } from "$tests/mocks/transaction-fee.mock";
import {
  AMOUNT_INPUT_SELECTOR,
  enterAmount,
} from "$tests/utils/neurons-modal.test-utils";
import { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { SnsNervousSystemParameters } from "@dfinity/sns";
import { fireEvent, waitFor } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import { vi } from "vitest";

vi.mock("$lib/services/sns-neurons.services", () => {
  return {
    stakeNeuron: vi.fn().mockResolvedValue({ success: true }),
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
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe)
  );

  beforeEach(() => {
    vi.spyOn(snsAccountsStore, "subscribe").mockImplementation(
      mockSnsAccountsStoreSubscribe(mockPrincipal)
    );
    vi.spyOn(snsSelectedTransactionFeeStore, "subscribe").mockImplementation(
      mockSnsSelectedTransactionFeeStoreSubscribe()
    );
    vi.spyOn(selectedUniverseIdStore, "subscribe").mockImplementation(
      (run: Subscriber<Principal>): (() => void) => {
        run(mockPrincipal);
        return () => undefined;
      }
    );

    page.mock({ data: { universe: mockPrincipal.toText() } });

    snsParametersStore.reset();
  });

  it("should stake a new sns neuron", async () => {
    const renderResult = await renderTransactionModal();

    await enterAmount(renderResult);

    const { getByTestId } = renderResult;

    const confirmButton = getByTestId("transaction-button-execute");
    fireEvent.click(confirmButton);

    await waitFor(() => expect(stakeNeuron).toBeCalled());
  });

  it("should show error if amount is less than minimum stake in parameter", async () => {
    const minimumAmount = 1;
    const snsParameters: SnsNervousSystemParameters = {
      ...snsNervousSystemParametersMock,
      neuron_minimum_stake_e8s: [BigInt(minimumAmount * E8S_PER_ICP)],
    };
    snsParametersStore.setParameters({
      rootCanisterId: mockPrincipal,
      parameters: snsParameters,
      certified: true,
    });
    const { getByTestId, container } = await renderTransactionModal();

    await waitFor(() =>
      expect(getByTestId("transaction-step-1")).toBeInTheDocument()
    );
    const nextButton = getByTestId("transaction-button-next");
    expect(nextButton?.hasAttribute("disabled")).toBeTruthy();

    // Enter amount
    const input = container.querySelector(AMOUNT_INPUT_SELECTOR);
    input && fireEvent.input(input, { target: { value: minimumAmount / 2 } });
    await waitFor(() =>
      expect(getByTestId("input-error-message")).toBeInTheDocument()
    );
    expect(nextButton?.hasAttribute("disabled")).toBeTruthy();
  });
});
