import SnsNeuronVestingPeriodRemaining from "$lib/components/sns-neuron-detail/SnsNeuronVestingPeriodRemaining.svelte";
import { SECONDS_IN_DAY, SECONDS_IN_MONTH } from "$lib/constants/constants";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { SnsNeuronVestingPeriodRemainingPo } from "$tests/page-objects/SnsNeuronVestingPeriodRemaining.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsNeuronVestingPeriodRemaining", () => {
  const now = 1686806749421;
  const nowSeconds = Math.floor(now / 1000);
  const yesterday = BigInt(nowSeconds - SECONDS_IN_DAY);
  const monthAgo = BigInt(nowSeconds - SECONDS_IN_MONTH);
  const oneWeek = BigInt(SECONDS_IN_DAY * 7);
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(now);
  });

  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronVestingPeriodRemaining, {
      props: { neuron },
    });

    return SnsNeuronVestingPeriodRemainingPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render vesting period if still vesting", async () => {
    const neuronVesting: SnsNeuron = {
      ...mockSnsNeuron,
      created_timestamp_seconds: yesterday,
      vesting_period_seconds: [BigInt(SECONDS_IN_MONTH)],
    };

    const po = renderComponent(neuronVesting);

    expect(await po.getVestingPeriod()).toBe("29 days, 10 hours");
  });

  it("should not render vesting period if no vesting value", async () => {
    const neuronNoVesting: SnsNeuron = {
      ...mockSnsNeuron,
      created_timestamp_seconds: yesterday,
      vesting_period_seconds: [],
    };

    const po = renderComponent(neuronNoVesting);

    expect(await po.vestingPeriodIsPresent()).toBe(false);
  });

  it("should not render vesting period if vesting passed", async () => {
    const neuronFinishedVesting: SnsNeuron = {
      ...mockSnsNeuron,
      created_timestamp_seconds: monthAgo,
      vesting_period_seconds: [oneWeek],
    };

    const po = renderComponent(neuronFinishedVesting);

    expect(await po.vestingPeriodIsPresent()).toBe(false);
  });
});
