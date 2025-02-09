import NnsNeuronDissolveDelayItemAction from "$lib/components/neuron-detail/NnsNeuronDissolveDelayItemAction.svelte";
import { SECONDS_IN_MONTH, SECONDS_IN_YEAR } from "$lib/constants/constants";
import NeuronContextActionsTest from "$tests/lib/components/neuron-detail/NeuronContextActionsTest.svelte";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronDissolveDelayItemActionPo } from "$tests/page-objects/NnsNeuronDissolveDelayItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsNeuronDissolveDelayItemAction", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronDissolveDelayItemAction,
      },
    });

    return NnsNeuronDissolveDelayItemActionPo.under(
      new JestPageObjectElement(container)
    );
  };

  const controlledNeuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockNeuron.fullNeuron,
      controller: mockIdentity.getPrincipal().toText(),
    },
  };

  beforeEach(() => {
    resetIdentity();
  });

  it("should render dissolve delay text and bonus if neuron is locked", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      state: NeuronState.Locked,
      dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR * 2),
    };
    const po = renderComponent(neuron);

    expect(await po.getDissolveState()).toBe(
      "Dissolve Delay: 2 years, 12 hours"
    );
    expect(await po.getDissolveBonus()).toBe("Dissolve delay bonus: +25%");
    expect(await po.hasIncreaseDissolveDelayButton()).toBe(true);
  });

  it("should render remaining text and bonus if neuron is dissolving", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      state: NeuronState.Dissolving,
      dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR * 2),
      fullNeuron: {
        ...controlledNeuron.fullNeuron,
        dissolveState: {
          DissolveDelaySeconds: BigInt(SECONDS_IN_YEAR * 2),
        },
      },
    };
    const po = renderComponent(neuron);

    expect(await po.getDissolveState()).toBe("Remaining: 2 years, 12 hours");
    expect(await po.getDissolveBonus()).toBe("Dissolve delay bonus: +25%");
    expect(await po.hasIncreaseDissolveDelayButton()).toBe(true);
  });

  it("should render no bonus text if neuron is dissolving less than 6 months", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      state: NeuronState.Dissolving,
      dissolveDelaySeconds: BigInt(SECONDS_IN_MONTH * 4),
    };
    const po = renderComponent(neuron);

    expect(await po.getDissolveBonus()).toBe("No dissolve delay bonus");
  });

  it("should render dissolve delay text with 0 and no bonus text if neuron is unlocked", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      state: NeuronState.Dissolved,
      dissolveDelaySeconds: 0n,
    };
    const po = renderComponent(neuron);

    expect(await po.getDissolveState()).toBe("Dissolve Delay: 0");
    expect(await po.getDissolveBonus()).toBe("No dissolve delay bonus");
    expect(await po.hasIncreaseDissolveDelayButton()).toBe(true);
  });

  it("should not render increase dissolve delay button if user is not the controller", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      state: NeuronState.Dissolved,
      dissolveDelaySeconds: 0n,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: "not-controller",
      },
    };
    const po = renderComponent(neuron);

    expect(await po.hasIncreaseDissolveDelayButton()).toBe(false);
  });

  it("should render increase dissolve delay button if controlled by Ledger device", async () => {
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: [],
      hardwareWallets: [mockHardwareWalletAccount],
    });
    const neuron: NeuronInfo = {
      ...mockNeuron,
      state: NeuronState.Dissolved,
      dissolveDelaySeconds: 0n,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockHardwareWalletAccount.principal.toText(),
      },
    };
    const po = renderComponent(neuron);

    expect(await po.hasIncreaseDissolveDelayButton()).toBe(true);
  });

  it("should not render a tooltip without dissolve delay", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      state: NeuronState.Dissolved,
      dissolveDelaySeconds: 0n,
    };
    const po = renderComponent(neuron);

    expect(await po.getTooltipIconPo().isPresent()).toBe(false);
  });

  it("should render tooltip when locked", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      state: NeuronState.Locked,
      dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR * 2),
    };
    const po = renderComponent(neuron);

    expect(await po.getTooltipIconPo().getTooltipText()).toBe(
      "Dissolve delay is the minimum amount of time you have to wait for the neuron to unlock, and ICP to be available again. If your neuron is dissolving, your ICP will be available in 2 years, 12 hours."
    );
  });

  it("should render tooltip when dissolving", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      state: NeuronState.Dissolving,
      dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR * 2),
    };
    const po = renderComponent(neuron);

    expect(await po.getTooltipIconPo().getTooltipText()).toBe(
      "Dissolve delay is the minimum amount of time you have to wait for the neuron to unlock, and ICP to be available again. If your neuron is dissolving, your ICP will be available in 2 years, 12 hours."
    );
  });
});
