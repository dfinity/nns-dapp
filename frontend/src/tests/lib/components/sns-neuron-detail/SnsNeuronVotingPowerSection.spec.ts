import SnsNeuronVotingPowerSection from "$lib/components/sns-neuron-detail/SnsNeuronVotingPowerSection.svelte";
import {
  SECONDS_IN_DAY,
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_YEAR,
} from "$lib/constants/constants";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { SnsNeuronVotingPowerSectionPo } from "$tests/page-objects/SnsNeuronVotingPowerSection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("NnsStakeItemAction", () => {
  const nowInSeconds = 1689843195;
  const minDissolveDelayToVote = BigInt(30 * SECONDS_IN_DAY);
  const maxDissolveDelay = BigInt(SECONDS_IN_EIGHT_YEARS);
  const maxDissolveDelayBonusMultiplier = 2;
  const maxDissolveDelayBonusPercentage =
    100 * (maxDissolveDelayBonusMultiplier - 1);
  const maxAgeForBonus = BigInt(SECONDS_IN_YEAR);
  const maxAgeBonusMultiplier = 1.25;
  const maxAgeBonusPercentage = 100 * (maxAgeBonusMultiplier - 1);

  const neuronCanVote = createMockSnsNeuron({
    id: [1],
    stake: 300_000_000n,
    stakedMaturity: 100_000_000n,
    state: NeuronState.Locked,
    dissolveDelaySeconds: maxDissolveDelay,
    ageSinceTimestampSeconds: BigInt(nowInSeconds) - maxAgeForBonus,
  });
  const neuronCanNotVote = createMockSnsNeuron({
    id: [1],
    stake: 314_000_000n,
    state: NeuronState.Locked,
    dissolveDelaySeconds: minDissolveDelayToVote - 1n,
  });
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronVotingPowerSection, {
      props: {
        neuron,
        parameters: {
          ...snsNervousSystemParametersMock,
          max_dissolve_delay_seconds: [maxDissolveDelay],
          max_dissolve_delay_bonus_percentage: [
            BigInt(maxDissolveDelayBonusPercentage),
          ],
          neuron_minimum_stake_e8s: [100_000_000n],
          max_neuron_age_for_age_bonus: [maxAgeForBonus],
          neuron_minimum_dissolve_delay_to_vote_seconds: [
            minDissolveDelayToVote,
          ],
          max_age_bonus_percentage: [BigInt(maxAgeBonusPercentage)],
        },
        token: mockToken,
      },
    });

    return SnsNeuronVotingPowerSectionPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(nowInSeconds * 1000);
  });

  it("should render no voting power if neuron can't vote", async () => {
    const po = renderComponent(neuronCanNotVote);
    expect(await po.getVotingPower()).toBe("None");
  });

  it("should render no voting power description if neuron can't vote", async () => {
    const po = renderComponent(neuronCanNotVote);

    expect(await po.getDescription()).toBe(
      "The dissolve delay must be at least 30 days for the neuron to have voting power. Learn more about voting power on the dashboard."
    );
  });

  it("should render voting power and description if neuron can vote", async () => {
    const po = renderComponent(neuronCanVote);

    expect(await po.getVotingPower()).toBe("10.00");
    expect(await po.getDescription()).toBe(
      "voting_power = (3.00 + 1.00) × 1.25 × 2.00 = 10.00"
    );
  });

  it("should render item actions", async () => {
    const po = renderComponent(mockSnsNeuron);

    expect(await po.hasStakeItemAction()).toBe(true);
    expect(await po.hasStateItemAction()).toBe(true);
    expect(await po.hasDissolveDelayItemActionPo()).toBe(true);
  });
});
