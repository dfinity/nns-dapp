import NnsNeuronsMissingRewardsBadge from "$lib/components/neurons/NnsNeuronsMissingRewardsBadge.svelte";
import { SECONDS_IN_HALF_YEAR } from "$lib/constants/constants";
import { networkEconomicsStore } from "$lib/stores/network-economics.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockNetworkEconomics } from "$tests/mocks/network-economics.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronsMissingRewardsBadgePo } from "$tests/page-objects/NnsNeuronsMissingRewardsBadge.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

describe("NnsNeuronsMissingRewardsBadge", () => {
  const nowSeconds = nowInSeconds();
  const activeNeuron = {
    ...mockNeuron,
    neuronId: 0n,
    fullNeuron: {
      ...mockFullNeuron,
      votingPowerRefreshedTimestampSeconds: BigInt(nowSeconds),
      controller: mockIdentity.getPrincipal().toText(),
    },
  };
  const losingRewardsNeuron = {
    ...mockNeuron,
    neuronId: 2n,
    fullNeuron: {
      ...mockFullNeuron,
      votingPowerRefreshedTimestampSeconds: BigInt(
        nowSeconds - SECONDS_IN_HALF_YEAR
      ),
      controller: mockIdentity.getPrincipal().toText(),
    },
  };
  const renderComponent = async () => {
    const { container } = render(NnsNeuronsMissingRewardsBadge);
    return NnsNeuronsMissingRewardsBadgePo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    vi.useFakeTimers({
      now: nowSeconds * 1000,
    });
    networkEconomicsStore.setParameters({
      parameters: mockNetworkEconomics,
      certified: true,
    });
  });

  it("should be visible when there is an inactive neuron", async () => {
    neuronsStore.setNeurons({
      neurons: [activeNeuron, losingRewardsNeuron],
      certified: true,
    });
    const po = await renderComponent();

    expect(await po.isVisible()).toBe(true);
  });

  it("should be hidden when there is no inactive neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [activeNeuron],
      certified: true,
    });
    const po = await renderComponent();

    expect(await po.isVisible()).toBe(false);
  });

  it("should be hidden when there is no neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [],
      certified: true,
    });
    const po = await renderComponent();

    expect(await po.isVisible()).toBe(false);
  });
});
