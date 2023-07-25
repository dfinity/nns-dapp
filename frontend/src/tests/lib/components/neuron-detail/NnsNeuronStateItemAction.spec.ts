import NnsNeuronStateItemAction from "$lib/components/neuron-detail/NnsNeuronStateItemAction.svelte";
import { SECONDS_IN_FOUR_YEARS } from "$lib/constants/constants";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronStateItemActionPo } from "$tests/page-objects/NnsNeuronStateItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NnsNeuronStateItemAction", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronStateItemAction,
      },
    });

    return NnsNeuronStateItemActionPo.under(
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

  const notControlledNeuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockNeuron.fullNeuron,
      controller: "some-other-principal",
    },
  };

  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render locked text and Start dissolving button if neuron is locked", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      state: NeuronState.Locked,
    };
    const po = renderComponent(neuron);

    expect(await po.getState()).toBe("Locked");
    expect(await po.getDissolveButtonText()).toBe("Start Dissolving");
  });

  it("should not render dissolving button if neuron is locked but user is not the controller", async () => {
    const neuron: NeuronInfo = {
      ...notControlledNeuron,
      state: NeuronState.Locked,
    };
    const po = renderComponent(neuron);

    expect(await po.getDissolveButtonPo().isPresent()).toBe(false);
  });

  it("should render dissolving text and Stop dissolving button if neuron is dissolving", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      state: NeuronState.Dissolving,
    };
    const po = renderComponent(neuron);

    expect(await po.getState()).toBe("Dissolving");
    expect(await po.getDissolveButtonText()).toBe("Stop Dissolving");
  });

  it("should not render dissolve button if neuron is dissolving but user is not the controller", async () => {
    const neuron: NeuronInfo = {
      ...notControlledNeuron,
      state: NeuronState.Dissolving,
    };
    const po = renderComponent(neuron);

    expect(await po.getDissolveButtonPo().isPresent()).toBe(false);
  });

  it("should render dissolve button if hardware wallet is the controller", async () => {
    icpAccountsStore.setForTesting({
      main: mockMainAccount,
      subAccounts: [],
      hardwareWallets: [mockHardwareWalletAccount],
    });
    const neuron: NeuronInfo = {
      ...notControlledNeuron,
      state: NeuronState.Dissolving,
      fullNeuron: {
        ...notControlledNeuron.fullNeuron,
        controller: mockHardwareWalletAccount.principal.toText(),
      },
    };
    const po = renderComponent(neuron);

    expect(await po.getDissolveButtonPo().isPresent()).toBe(true);
  });

  it("should render unlocked text and disburse button if neuron is unlocked", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      state: NeuronState.Dissolved,
    };
    const po = renderComponent(neuron);

    expect(await po.getState()).toBe("Unlocked");
    expect(await po.hasDisburseButton()).toBe(true);
  });

  it("should not render disburse button if neuron is unlocked but user is not the controller", async () => {
    const neuron: NeuronInfo = {
      ...notControlledNeuron,
      state: NeuronState.Dissolved,
    };
    const po = renderComponent(neuron);

    expect(await po.hasDisburseButton()).toBe(false);
  });

  it("should render age bonus for Locked neurons", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      state: NeuronState.Locked,
      ageSeconds: BigInt(SECONDS_IN_FOUR_YEARS),
    };
    const po = renderComponent(neuron);

    expect(await po.getAgeBonus()).toBe("Age bonus: 1.25");
  });

  it("should render no age bonus for dissolving neurons", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      state: NeuronState.Dissolving,
    };
    const po = renderComponent(neuron);

    expect(await po.getAgeBonus()).toBe("No age bonus");
  });

  it("should render no age bonus for unlocked neurons", async () => {
    const neuron: NeuronInfo = {
      ...controlledNeuron,
      state: NeuronState.Dissolving,
    };
    const po = renderComponent(neuron);

    expect(await po.getAgeBonus()).toBe("No age bonus");
  });
});
