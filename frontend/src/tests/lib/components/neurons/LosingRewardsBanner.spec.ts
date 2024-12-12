import * as governanceApi from "$lib/api/governance.api";
import LosingRewardsBanner from "$lib/components/neurons/LosingRewardsBanner.svelte";
import { SECONDS_IN_DAY, SECONDS_IN_HALF_YEAR } from "$lib/constants/constants";
import { neuronsStore } from "$lib/stores/neurons.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { LosingRewardsBannerPo } from "$tests/page-objects/LosingRewardsBanner.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";

describe("LosingRewardsBanner", () => {
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
  const in10DaysLosingRewardsNeuron = {
    ...mockNeuron,
    neuronId: 1n,
    fullNeuron: {
      ...mockFullNeuron,
      votingPowerRefreshedTimestampSeconds: BigInt(
        nowSeconds - SECONDS_IN_HALF_YEAR + 10 * SECONDS_IN_DAY
      ),
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
  const neurons = [
    activeNeuron,
    in10DaysLosingRewardsNeuron,
    losingRewardsNeuron,
  ];
  const refreshedNeurons = neurons.map((neuron) => ({
    ...neuron,
    fullNeuron: {
      ...neuron.fullNeuron,
      votingPowerRefreshedTimestampSeconds: BigInt(nowSeconds),
    },
  }));

  const renderComponent = () => {
    const { container } = render(LosingRewardsBanner);
    return LosingRewardsBannerPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();
    vi.useFakeTimers({
      now: nowSeconds * 1000,
    });

    vi.spyOn(governanceApi, "queryKnownNeurons").mockResolvedValue([]);
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue(refreshedNeurons);
    vi.spyOn(governanceApi, "refreshVotingPower").mockResolvedValue();
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
      neurons,
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
      "ICP neurons that are inactive for 6 months start missing voting rewards. To avoid missing rewards, vote manually, edit, or confirm your following."
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

  it("should close modal when all refreshed", async () => {
    const spyRefreshVotingPower = vi
      .spyOn(governanceApi, "refreshVotingPower")
      .mockResolvedValue();
    neuronsStore.setNeurons({
      neurons: [losingRewardsNeuron],
      certified: true,
    });
    const po = await renderComponent();

    expect(await po.getLosingRewardNeuronsModalPo().isPresent()).toEqual(false);
    await po.clickConfirm();
    expect(await po.getLosingRewardNeuronsModalPo().isPresent()).toEqual(true);

    await po.getLosingRewardNeuronsModalPo().clickConfirmFollowing();
    await runResolvedPromises();

    vi.advanceTimersToNextFrame();
    expect(spyRefreshVotingPower).toBeCalledTimes(1);
    expect(await po.getLosingRewardNeuronsModalPo().isPresent()).toEqual(false);
  });

  it("should not close the modal on error", async () => {
    const spyConsoleError = vi.spyOn(console, "error").mockReturnValue();
    const spyRefreshVotingPower = vi
      .spyOn(governanceApi, "refreshVotingPower")
      .mockRejectedValueOnce(new Error());

    neuronsStore.setNeurons({
      neurons: [losingRewardsNeuron],
      certified: true,
    });
    const po = await renderComponent();

    await po.clickConfirm();
    await runResolvedPromises();
    await po.getLosingRewardNeuronsModalPo().clickConfirmFollowing();
    await runResolvedPromises();

    expect(spyRefreshVotingPower).toBeCalledTimes(1);
    expect(spyConsoleError).toBeCalledTimes(1);
    expect(await po.getLosingRewardNeuronsModalPo().isPresent()).toEqual(true);
  });
});
