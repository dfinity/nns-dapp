import LosingRewardsBanner from "$lib/components/neurons/LosingRewardsBanner.svelte";
import { SECONDS_IN_DAY, SECONDS_IN_HALF_YEAR } from "$lib/constants/constants";
import { neuronsStore } from "$lib/stores/neurons.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { LosingRewardsBannerPo } from "$tests/page-objects/LosingRewardsBanner.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

describe("LosingRewardsBanner", () => {
  const nowSeconds = nowInSeconds();
  const activeNeuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      votingPowerRefreshedTimestampSeconds: BigInt(nowSeconds),
    },
  };
  const in10DaysLosingRewardsNeuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      votingPowerRefreshedTimestampSeconds: BigInt(
        nowSeconds - SECONDS_IN_HALF_YEAR + 10 * SECONDS_IN_DAY
      ),
    },
  };
  const losingRewardsNeuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      votingPowerRefreshedTimestampSeconds: BigInt(
        nowSeconds - SECONDS_IN_HALF_YEAR
      ),
    },
  };

  const renderComponent = () => {
    const { container } = render(LosingRewardsBanner);
    return LosingRewardsBannerPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.useFakeTimers({
      now: nowSeconds * 1000,
    });
  });

  it("should not display banner when all neurons are active", async () => {
    neuronsStore.setNeurons({
      neurons: [activeNeuron],
      certified: true,
    });
    const po = await renderComponent();
    expect(await po.isVisible()).toBe(false);
  });

  it("should display banner when soon inactive neuron available", async () => {
    neuronsStore.setNeurons({
      neurons: [losingRewardsNeuron],
      certified: true,
    });
    const po = await renderComponent();
    expect(await po.isVisible()).toBe(true);
  });

  it("displays soon losing title ", async () => {
    neuronsStore.setNeurons({
      neurons: [activeNeuron, in10DaysLosingRewardsNeuron],
      certified: true,
    });
    const po = await renderComponent();
    expect(await po.getTitle()).toBe(
      "10 days left to confirm your neuron following"
    );
  });

  it("displays losing rewards title ", async () => {
    neuronsStore.setNeurons({
      neurons: [activeNeuron, in10DaysLosingRewardsNeuron, losingRewardsNeuron],
      certified: true,
    });
    const po = await renderComponent();
    expect(await po.getTitle()).toBe(
      "One or more of your neurons are missing voting rewards"
    );
  });

  it("displays description ", async () => {
    neuronsStore.setNeurons({
      neurons: [activeNeuron, in10DaysLosingRewardsNeuron],
      certified: true,
    });
    const po = await renderComponent();

    expect(await po.getText()).toBe(
      "ICP neurons that are inactive for 6 months start losing voting rewards. In order to avoid losing rewards, vote manually, edit or confirm your following."
    );
  });

  it("should open losing reward neurons modal", async () => {
    neuronsStore.setNeurons({
      neurons: [activeNeuron, in10DaysLosingRewardsNeuron],
      certified: true,
    });
    const po = await renderComponent();

    expect(await po.getLosingRewardNeuronsModalPo().isPresent()).toEqual(false);
    await po.clickConfirm();
    expect(await po.getLosingRewardNeuronsModalPo().isPresent()).toEqual(true);
  });
});
