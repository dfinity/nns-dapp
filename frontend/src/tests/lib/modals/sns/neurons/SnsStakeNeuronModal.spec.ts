import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
import SnsStakeNeuronModal from "$lib/modals/sns/neurons/SnsStakeNeuronModal.svelte";
import * as snsNeuronsServices from "$lib/services/sns-neurons.services";
import { stakeNeuron } from "$lib/services/sns-neurons.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { page } from "$mocks/$app/stores";
import { mockPrincipal, resetIdentity } from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { mockSnsSelectedTransactionFeeStoreSubscribe } from "$tests/mocks/transaction-fee.mock";
import { SnsStakeNeuronModalPo } from "$tests/page-objects/SnsStakeNeuronModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { Principal } from "@dfinity/principal";
import { TokenAmount } from "@dfinity/utils";
import type { Subscriber } from "svelte/store";

describe("SnsStakeNeuronModal", () => {
  const ledgerCanisterId = principal(3);
  const token = { name: "POP", symbol: "POP", decimals: 8 };
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

  beforeEach(() => {
    resetIdentity();
    resetSnsProjects();
    icrcAccountsStore.reset();

    setSnsProjects([
      {
        rootCanisterId: mockPrincipal,
        ledgerCanisterId,
      },
    ]);
    icrcAccountsStore.set({
      ledgerCanisterId,
      accounts: {
        accounts: [mockSnsMainAccount],
        certified: true,
      },
    });

    vi.spyOn(snsNeuronsServices, "stakeNeuron").mockResolvedValue({
      success: true,
    });
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
  });

  const renderComponent = async () => {
    const { container } = await renderTransactionModal();
    return SnsStakeNeuronModalPo.under(new JestPageObjectElement(container));
  };

  it("should show token in modal title", async () => {
    const po = await renderComponent();
    expect(await po.getModalTitle()).toBe("Stake POP");
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
    setSnsProjects([
      {
        rootCanisterId: mockPrincipal,
        ledgerCanisterId,
        neuronMinimumStakeE8s: 100_000_000n,
      },
    ]);
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
      "Sorry, the amount is too small. You need to stake a minimum of 1 POP."
    );
  });
});
