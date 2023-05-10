import SnsNeuronInfoStake from "$lib/components/sns-neuron-detail/SnsNeuronInfoStake.svelte";
import { authStore } from "$lib/stores/auth.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { page } from "$mocks/$app/stores";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import {
  mockSnsNeuron,
  mockSnsNeuronWithPermissions,
} from "$tests/mocks/sns-neurons.mock";
import { snsResponsesForLifecycle } from "$tests/mocks/sns-response.mock";
import { SnsNeuronInfoStakePo } from "$tests/page-objects/SnsNeuronInfoStake.page-object";
import { VitestPageObjectElement } from "$tests/page-objects/vitest.page-object";
import {
  SnsNeuronPermissionType,
  SnsSwapLifecycle,
  type SnsNeuron,
} from "@dfinity/sns";
import { vi } from "vitest";

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

    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render disburse button", async () => {
    const neuron = mockSnsNeuronWithPermissions([
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE,
    ]);
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: vi.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(
      new VitestPageObjectElement(container)
    );

    expect(await po.hasDisburseButton()).toBe(true);
  });

  it("should not render disburse button if user has no permissions to disburse", async () => {
    const neuron = mockSnsNeuronWithPermissions([]);
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: vi.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(
      new VitestPageObjectElement(container)
    );

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
      reload: vi.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(
      new VitestPageObjectElement(container)
    );

    expect(await po.hasDissolveButton()).toBe(true);
  });

  it("should not render dissolve button if user has no permissions to dissolve", async () => {
    const neuron = mockSnsNeuronWithPermissions([]);
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: vi.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(
      new VitestPageObjectElement(container)
    );

    expect(await po.isContentLoaded()).toBe(true);
    expect(await po.hasDissolveButton()).toBe(false);
  });

  it("renders increase dissolve delay button", async () => {
    const neuron = mockSnsNeuronWithPermissions([
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_CONFIGURE_DISSOLVE_STATE,
    ]);
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: vi.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(
      new VitestPageObjectElement(container)
    );

    expect(await po.hasIncreaseDissolveDelayButton()).toBe(true);
  });

  it("should not render increase dissolve delay button", async () => {
    const neuron = mockSnsNeuronWithPermissions([]);
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron,
      reload: vi.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(
      new VitestPageObjectElement(container)
    );

    expect(await po.isContentLoaded()).toBe(true);
    expect(await po.hasIncreaseDissolveDelayButton()).toBe(false);
  });

  it("should render increase state button if neuron doesn't belong to the Community Fund", async () => {
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronInfoStake,
      neuron: mockSnsNeuron,
      reload: vi.fn(),
    });

    const po = SnsNeuronInfoStakePo.under(
      new VitestPageObjectElement(container)
    );

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
      reload: vi.fn(),
    });
    const po = SnsNeuronInfoStakePo.under(
      new VitestPageObjectElement(container)
    );

    expect(await po.isContentLoaded()).toBe(true);
    expect(await po.hasIncreaseStakeButton()).toBe(false);
  });
});
