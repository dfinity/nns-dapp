/**
 * @jest-environment jsdom
 */

import SnsNeuronInfoStake from "$lib/components/sns-neuron-detail/SnsNeuronInfoStake.svelte";
import { authStore } from "$lib/stores/auth.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { enumValues } from "$lib/utils/enum.utils";
import { page } from "$mocks/$app/stores";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
  mockSnsNeuronWithPermissions,
} from "$tests/mocks/sns-neurons.mock";
import { snsResponsesForLifecycle } from "$tests/mocks/sns-response.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { SnsNeuronInfoStakePo } from "$tests/page-objects/SnsNeuronInfoStake.page-object";
import {
  SnsNeuronPermissionType,
  SnsSwapLifecycle,
  type SnsNeuron,
} from "@dfinity/sns";
import type { NeuronPermission } from "@dfinity/sns/dist/candid/sns_governance";

describe("SnsNeuronInfoStake", () => {
  const data = snsResponsesForLifecycle({
    lifecycles: [SnsSwapLifecycle.Committed],
  });
  beforeEach(() => {
    const universe = data[0][0].rootCanisterId;
    page.mock({
      data: { universe },
    });

    snsQueryStore.setData(data);

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  const allPermissions: NeuronPermission[] = [
    {
      principal: [mockPrincipal],
      permission_type: Int32Array.from(enumValues(SnsNeuronPermissionType)),
    },
  ];

  it("should render disburse button", async () => {
    const neuronWithPermissions = mockSnsNeuronWithPermissions([
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE,
    ]);
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron: neuronWithPermissions,
      reload: jest.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(new JestPageObjectElement(container));

    expect(await po.hasDisburseButton()).toBe(true);
  });

  it("should not render disburse button if user has no permissions to disburse", async () => {
    const neuron = mockSnsNeuronWithPermissions([]);
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: jest.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(new JestPageObjectElement(container));

    expect(await po.isContentLoaded()).toBe(true);
    expect(await po.hasDisburseButton()).toBe(false);
  });

  it("should render dissolve button", async () => {
    const neuron: SnsNeuron = {
      ...mockSnsNeuronWithPermissions([
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_CONFIGURE_DISSOLVE_STATE,
      ]),
      dissolve_state: [
        {
          DissolveDelaySeconds: BigInt(1234444),
        },
      ],
    };
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: jest.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(new JestPageObjectElement(container));

    expect(await po.hasDissolveButton()).toBe(true);
  });

  it("should not render dissolve button if user has no permissions to dissolve", async () => {
    const neuron: SnsNeuron = createMockSnsNeuron({
      permissions: allPermissions,
      vesting: true,
      id: [1],
    });
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: jest.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(new JestPageObjectElement(container));

    expect(await po.isContentLoaded()).toBe(true);
    expect(await po.getDisburseButtonPo().isDisabled()).toBe(false);
  });

  it("should render disabled dissolve button if neuron is vesting", async () => {
    const neuron: SnsNeuron = createMockSnsNeuron({
      permissions: allPermissions,
      vesting: true,
      id: [1],
    });
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: jest.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(new JestPageObjectElement(container));

    expect(await po.isContentLoaded()).toBe(true);
    expect(await po.getDissolveButtonPo().isDisabled()).toBe(true);
  });

  it("renders increase dissolve delay button", async () => {
    const neuron = mockSnsNeuronWithPermissions([
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_CONFIGURE_DISSOLVE_STATE,
    ]);
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: jest.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(new JestPageObjectElement(container));

    expect(await po.hasIncreaseDissolveDelayButton()).toBe(true);
  });

  it("should not render increase dissolve delay button if user doesn't have permissions", async () => {
    const neuron = mockSnsNeuronWithPermissions([]);
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: jest.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(new JestPageObjectElement(container));

    expect(await po.isContentLoaded()).toBe(true);
    expect(await po.hasIncreaseDissolveDelayButton()).toBe(false);
  });

  it("should render disabled increase dissolve delay button if neuron is vesting", async () => {
    const neuron: SnsNeuron = createMockSnsNeuron({
      permissions: allPermissions,
      vesting: true,
      id: [1],
    });
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: jest.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(new JestPageObjectElement(container));

    expect(await po.isContentLoaded()).toBe(true);
    expect(await po.getIncreaseDissolveDelayButtonPo().isDisabled()).toBe(true);
  });

  it("should render increase state button if neuron doesn't belong to the Community Fund", async () => {
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron: mockSnsNeuron,
      reload: jest.fn(),
    });

    const po = SnsNeuronInfoStakePo.under(new JestPageObjectElement(container));

    expect(await po.hasIncreaseStakeButton()).toBe(true);
  });

  it("should not render increase state button if neuron belongs to the Community Fund", async () => {
    const neuron: SnsNeuron = {
      ...mockSnsNeuron,
      source_nns_neuron_id: [BigInt(12345)],
    };
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: jest.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(new JestPageObjectElement(container));

    expect(await po.isContentLoaded()).toBe(true);
    expect(await po.hasIncreaseStakeButton()).toBe(false);
  });
});
