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
import {
  mockSnsAccountsStoreSubscribe,
  mockSnsMainAccount,
} from "$tests/mocks/sns-accounts.mock";
import { snsNervousSystemParametersMock } from "$tests/mocks/sns-neurons.mock";
import { mockSnsSelectedTransactionFeeStoreSubscribe } from "$tests/mocks/transaction-fee.mock";
import { SnsStakeNeuronModalPo } from "$tests/page-objects/SnsStakeNeuronModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { Principal } from "@dfinity/principal";
import type { SnsNervousSystemParameters } from "@dfinity/sns";
import { TokenAmount } from "@dfinity/utils";
import type { Subscriber } from "svelte/store";

vi.mock("$lib/services/sns-neurons.services", () => {
  return {
    stakeNeuron: vi.fn().mockResolvedValue({ success: true }),
  };
});

describe("SnsStakeNeuronModal", () => {
  const token = { name: "SNS", symbol: "SNS", decimals: 8 };
  const renderTransactionModal = () =>
    renderModal({
      component: SnsStakeNeuronModal,
      props: {
        token,
        transactionFee: TokenAmount.fromE8s({
          amount: 10_000n,
          token,
        }),
        rootCanisterId: mockPrincipal,
        governanceCanisterId: mockPrincipal,
      },
    });

  beforeAll(() => {
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
  });

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

  const renderComponent = async () => {
    const { container } = await renderTransactionModal();
    return SnsStakeNeuronModalPo.under(new JestPageObjectElement(container));
  };

  it("should show token in modal title", async () => {
    const po = await renderComponent();
    expect(await po.getModalTitle()).toBe("Stake SNS");
  });

  it("should stake a new sns neuron", async () => {
    const amount = 10;
    const po = await renderComponent();

    expect(stakeNeuron).not.toBeCalled();
    await po.stake(amount);
    expect(stakeNeuron).toBeCalledTimes(1);
    expect(stakeNeuron).toBeCalledWith({
      account: mockSnsMainAccount,
      amount,
      rootCanisterId: mockPrincipal,
    });
  });

  it("should show error if amount is less than minimum stake in parameter", async () => {
    const minimumAmount = 1;
    const snsParameters: SnsNervousSystemParameters = {
      ...snsNervousSystemParametersMock,
      neuron_minimum_stake_e8s: [100_000_000n],
    };
    snsParametersStore.setParameters({
      rootCanisterId: mockPrincipal,
      parameters: snsParameters,
      certified: true,
    });
    const po = await renderComponent();

    await runResolvedPromises();
    expect(
      await po.getTransactionFormPo().getContinueButtonPo().isDisabled()
    ).toBe(true);
    expect(await po.getTransactionFormPo().getAmountInputPo().hasError()).toBe(
      false
    );

    po.getTransactionFormPo().enterAmount(minimumAmount / 2);

    await runResolvedPromises();
    expect(
      await po.getTransactionFormPo().getContinueButtonPo().isDisabled()
    ).toBe(true);
    expect(await po.getTransactionFormPo().getAmountInputPo().hasError()).toBe(
      true
    );
    expect(
      await po.getTransactionFormPo().getAmountInputPo().getErrorMessage()
    ).toBe(
      "Sorry, the amount is too small. You need to stake a minimum of 1 SNS."
    );
  });
});
