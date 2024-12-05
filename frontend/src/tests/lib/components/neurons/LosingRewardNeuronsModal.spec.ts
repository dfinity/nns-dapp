import { clearCache } from "$lib/api-services/governance.api-service";
import * as governanceApi from "$lib/api/governance.api";
import { SECONDS_IN_DAY, SECONDS_IN_HALF_YEAR } from "$lib/constants/constants";
import LosingRewardNeuronsModal from "$lib/modals/neurons/LosingRewardNeuronsModal.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { LosingRewardNeuronsModalPo } from "$tests/page-objects/LosingRewardNeuronsModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { nonNullish } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("LosingRewardNeuronsModal", () => {
  const nowSeconds = nowInSeconds();
  const activeNeuron = {
    ...mockNeuron,
    neuronId: 0n,
    fullNeuron: {
      ...mockFullNeuron,
      votingPowerRefreshedTimestampSeconds: BigInt(nowSeconds),
    },
  };
  const in10DaysLosingRewardsNeuron = {
    ...mockNeuron,
    neuronId: 1n,
    fullNeuron: {
      ...mockFullNeuron,
      votingPowerRefreshedTimestampSeconds: BigInt(
        nowSeconds - SECONDS_IN_HALF_YEAR + 10 * SECONDS_IN_DAY
      ),
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
    },
  };

  const renderComponent = ({ onClose }: { onClose?: () => void } = {}) => {
    const { container, component } = render(LosingRewardNeuronsModal);

    if (nonNullish(onClose)) {
      component.$on("nnsClose", onClose);
    }

    return LosingRewardNeuronsModalPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    resetIdentity();
    // Remove known neurons from the cache.
    clearCache();

    vi.useFakeTimers({
      now: nowSeconds * 1000,
    });

    vi.spyOn(governanceApi, "queryKnownNeurons").mockResolvedValue([]);
  });

  it("should not display active neurons", async () => {
    neuronsStore.setNeurons({
      neurons: [activeNeuron, in10DaysLosingRewardsNeuron, losingRewardsNeuron],
      certified: true,
    });
    const po = await renderComponent();
    const cards = await po.getNnsLosingRewardsNeuronCardPos();

    expect(cards.length).toEqual(2);
    expect(await cards[0].getNeuronId()).toEqual(
      `${losingRewardsNeuron.neuronId}`
    );
    expect(await cards[1].getNeuronId()).toEqual(
      `${in10DaysLosingRewardsNeuron.neuronId}`
    );
  });

  it("should dispatch on close", async () => {
    neuronsStore.setNeurons({
      neurons: [activeNeuron, in10DaysLosingRewardsNeuron, losingRewardsNeuron],
      certified: true,
    });
    const onClose = vi.fn();
    const po = await renderComponent({
      onClose,
    });

    expect(onClose).toHaveBeenCalledTimes(0);
    await po.clickCancel();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should fetch known neurons", async () => {
    const queryKnownNeuronsSpy = vi
      .spyOn(governanceApi, "queryKnownNeurons")
      .mockResolvedValue([]);
    neuronsStore.setNeurons({
      neurons: [activeNeuron, in10DaysLosingRewardsNeuron, losingRewardsNeuron],
      certified: true,
    });

    expect(queryKnownNeuronsSpy).toHaveBeenCalledTimes(0);
    await renderComponent();
    await runResolvedPromises();
    expect(queryKnownNeuronsSpy).toHaveBeenCalledTimes(2);
    expect(queryKnownNeuronsSpy).toHaveBeenCalledWith({
      certified: true,
      identity: mockIdentity,
    });
    expect(queryKnownNeuronsSpy).toHaveBeenCalledWith({
      certified: false,
      identity: mockIdentity,
    });
  });
});
