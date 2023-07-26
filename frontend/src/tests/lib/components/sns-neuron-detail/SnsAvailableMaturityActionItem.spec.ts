/**
 * @jest-environment jsdom
 */

import SnsAvailableMaturityActionItem from "$lib/components/sns-neuron-detail/SnsAvailableMaturityActionItem.svelte";
import { authStore } from "$lib/stores/auth.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import {
  allSnsNeuronPermissions,
  createMockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { SnsAvailableMaturityActionItemPo } from "$tests/page-objects/SnsAvailableMaturityActionItem.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { Principal } from "@dfinity/principal";
import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./SnsNeuronContextTest.svelte";

describe("SnsAvailableMaturityActionItem", () => {
  const controllerPermissions = {
    principal: [mockIdentity.getPrincipal()] as [Principal],
    permission_type: allSnsNeuronPermissions,
  };
  const controlledNeuron = createMockSnsNeuron({
    id: [1],
    maturity: 314000000n,
    permissions: [controllerPermissions],
  });
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        passPropNeuron: true,
        rootCanisterId: mockCanisterId,
        testComponent: SnsAvailableMaturityActionItem,
      },
    });

    return SnsAvailableMaturityActionItemPo.under(
      new JestPageObjectElement(container)
    );
  };

  const noStakeMaturityPermissions = {
    principal: [mockIdentity.getPrincipal()] as [Principal],
    permission_type: allSnsNeuronPermissions.filter(
      (p) => p !== SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_STAKE_MATURITY
    ),
  };

  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render available maturity", async () => {
    const po = renderComponent(controlledNeuron);

    expect(await po.getMaturity()).toBe("3.14");
  });

  it("should render stake maturity button", async () => {
    const po = renderComponent(controlledNeuron);

    expect(await po.hasStakeButton()).toBe(true);
  });

  it("should not render stake maturity button if user has no stake maturity permission", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      permissions: [noStakeMaturityPermissions],
    });
    const po = renderComponent(neuron);

    expect(await po.hasStakeButton()).toBe(false);
  });
});
