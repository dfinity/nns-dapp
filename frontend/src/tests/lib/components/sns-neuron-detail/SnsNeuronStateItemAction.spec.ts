/**
 * @jest-environment jsdom
 */

import SnsNeuronStateItemAction from "$lib/components/sns-neuron-detail/SnsNeuronStateItemAction.svelte";
import { SECONDS_IN_FOUR_YEARS } from "$lib/constants/constants";
import { authStore } from "$lib/stores/auth.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  allSnsNeuronPermissions,
  createMockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { SnsNeuronStateItemActionPo } from "$tests/page-objects/SnsNeuronStateItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsNeuronStateItemAction", () => {
  const nowInSeconds = 1689843195;
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronStateItemAction, {
      props: {
        neuron,
        snsParameters: snsNervousSystemParametersMock,
      },
    });

    return SnsNeuronStateItemActionPo.under(
      new JestPageObjectElement(container)
    );
  };

  const controllerPermissions = {
    principal: [mockIdentity.getPrincipal()] as [Principal],
    permission_type: allSnsNeuronPermissions,
  };
  const noDissolvePermissions = {
    principal: [mockIdentity.getPrincipal()] as [Principal],
    permission_type: allSnsNeuronPermissions.filter(
      (p) =>
        p !==
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_CONFIGURE_DISSOLVE_STATE
    ),
  };
  const noDisbursePermissions = {
    principal: [mockIdentity.getPrincipal()] as [Principal],
    permission_type: allSnsNeuronPermissions.filter(
      (p) => p !== SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE
    ),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(nowInSeconds * 1000);
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render locked text and Start dissolving button if neuron is locked", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Locked,
      permissions: [controllerPermissions],
    });
    const po = renderComponent(neuron);

    expect(await po.getState()).toBe("Locked");
    expect(await po.getDissolveButtonText()).toBe("Start Dissolving");
  });

  it("should not render Start dissolving button if user has no dissolve permissions", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Locked,
      permissions: [noDissolvePermissions],
    });
    const po = renderComponent(neuron);

    expect(await po.getDissolveButtonPo().isPresent()).toBe(false);
    expect(await po.hasDisburseButton()).toBe(false);
  });

  it("should render dissolving text and Stop dissolving button if neuron is dissolving", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolving,
      permissions: [controllerPermissions],
    });
    const po = renderComponent(neuron);

    expect(await po.getState()).toBe("Dissolving");
    expect(await po.getDissolveButtonText()).toBe("Stop Dissolving");
  });

  it("should not render Stop dissolving button if user has no dissolve permissions", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolving,
      permissions: [noDissolvePermissions],
    });
    const po = renderComponent(neuron);

    expect(await po.getDissolveButtonPo().isPresent()).toBe(false);
    expect(await po.hasDisburseButton()).toBe(false);
  });

  it("should render unlocked text and disburse button if neuron is unlocked", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolved,
      permissions: [controllerPermissions],
    });
    const po = renderComponent(neuron);

    expect(await po.getState()).toBe("Unlocked");
    expect(await po.hasDisburseButton()).toBe(true);
  });

  it("should not render disburse button if user has no disburse permissions", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolved,
      permissions: [noDisbursePermissions],
    });
    const po = renderComponent(neuron);

    expect(await po.hasDisburseButton()).toBe(false);
    expect(await po.getDissolveButtonPo().isPresent()).toBe(false);
  });

  it("should render age bonus for Locked neurons", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Locked,
      permissions: [controllerPermissions],
      ageSinceTimestampSeconds: BigInt(nowInSeconds - SECONDS_IN_FOUR_YEARS),
    });
    const po = renderComponent(neuron);

    expect(await po.getAgeBonus()).toBe("Age bonus: +25%");
  });

  it("should render no age bonus for dissolving neurons", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolving,
      permissions: [controllerPermissions],
    });
    const po = renderComponent(neuron);

    expect(await po.getAgeBonus()).toBe("No age bonus");
  });

  it("should render no age bonus for unlocked neurons", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolved,
      permissions: [controllerPermissions],
    });
    const po = renderComponent(neuron);

    expect(await po.getAgeBonus()).toBe("No age bonus");
  });
});
