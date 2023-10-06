import SnsAvailableMaturityItemAction from "$lib/components/sns-neuron-detail/SnsAvailableMaturityItemAction.svelte";
import { authStore } from "$lib/stores/auth.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  allSnsNeuronPermissions,
  createMockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { SnsAvailableMaturityItemActionPo } from "$tests/page-objects/SnsAvailableMaturityItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { Principal } from "@dfinity/principal";
import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsAvailableMaturityItemAction", () => {
  const controllerPermissions = {
    principal: [mockIdentity.getPrincipal()] as [Principal],
    permission_type: allSnsNeuronPermissions,
  };
  const controlledNeuron = createMockSnsNeuron({
    id: [1],
    maturity: 314000000n,
    permissions: [controllerPermissions],
  });
  const renderComponent = (neuron: SnsNeuron, feeE8s = 10_000n) => {
    const { container } = render(SnsAvailableMaturityItemAction, {
      props: {
        neuron,
        feeE8s,
      },
    });

    return SnsAvailableMaturityItemActionPo.under(
      new JestPageObjectElement(container)
    );
  };

  const noStakeMaturityPermissions = {
    principal: [mockIdentity.getPrincipal()] as [Principal],
    permission_type: allSnsNeuronPermissions.filter(
      (p) => p !== SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_STAKE_MATURITY
    ),
  };
  const noDisburseMaturityPermissions = {
    principal: [mockIdentity.getPrincipal()] as [Principal],
    permission_type: allSnsNeuronPermissions.filter(
      (p) =>
        p !== SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE_MATURITY
    ),
  };

  beforeEach(() => {
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
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

  it("should render disburse maturity button when user has disburse maturity permission", async () => {
    const po = renderComponent(controlledNeuron);

    expect(await po.hasDisburseMaturityButton()).toBe(true);
  });

  it("should render disabled disburse maturity button when maturity is less than fee", async () => {
    const fee = 100_000_000n;
    const neuron = createMockSnsNeuron({
      id: [1],
      maturity: fee - 1n,
      permissions: [controllerPermissions],
    });
    const po = renderComponent(neuron, fee);

    expect(await po.getDisburseMaturityButtonPo().isDisabled()).toBe(true);
  });

  it("should not render stake maturity button if user has no disburse maturity permission", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      permissions: [noDisburseMaturityPermissions],
    });
    const po = renderComponent(neuron);

    expect(await po.hasDisburseMaturityButton()).toBe(false);
  });
});
