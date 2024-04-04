import NnsAvailableMaturityItemAction from "$lib/components/neuron-detail/NnsAvailableMaturityItemAction.svelte";
import { authStore } from "$lib/stores/auth.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsAvailableMaturityItemActionPo } from "$tests/page-objects/NnsAvailableMaturityItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  resetAccountsForTesting,
  setAccountsForTesting,
} from "$tests/utils/accounts.test-utils";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NnsAvailableMaturityItemAction", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsAvailableMaturityItemAction,
      },
    });

    return NnsAvailableMaturityItemActionPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
    resetAccountsForTesting();
  });

  it("should render available maturity", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        maturityE8sEquivalent: 314000000n,
      },
    };
    const po = renderComponent(neuron);

    expect(await po.getMaturity()).toBe("3.14");
  });

  it("should render buttons", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockIdentity.getPrincipal().toText(),
      },
    });

    expect(await po.hasSpawnButton()).toBe(true);
    expect(await po.hasStakeButton()).toBe(true);
  });

  it("should render buttons if controlled by attached hardware wallet", async () => {
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: [],
      hardwareWallets: [mockHardwareWalletAccount],
    });

    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockHardwareWalletAccount.principal.toText(),
      },
    });

    expect(await po.hasSpawnButton()).toBe(true);
    expect(await po.hasStakeButton()).toBe(true);
  });

  it("should not render buttons if user is not the controller", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockCanisterId.toText(),
      },
    });

    expect(await po.hasSpawnButton()).toBe(false);
    expect(await po.hasStakeButton()).toBe(false);
  });

  it("should have an appropriate tooltip ID", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.getTooltipIconPo().getTooltipPo().getTooltipId()).toBe(
      "available-maturity-tooltip"
    );
  });
});
