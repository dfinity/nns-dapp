import SnsNeuronVotingPowerSection from "$lib/components/sns-neuron-detail/SnsNeuronVotingPowerSection.svelte";
import { SECONDS_IN_YEAR } from "$lib/constants/constants";
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
  const neuronCanVote = createMockSnsNeuron({
    id: [1],
    stake: 314000000n,
    stakedMaturity: 100000000n,
    state: NeuronState.Locked,
    dissolveDelaySeconds:
      snsNervousSystemParametersMock
        .neuron_minimum_dissolve_delay_to_vote_seconds[0],
    ageSinceTimestampSeconds: BigInt(nowInSeconds - SECONDS_IN_YEAR),
  });
  const neuronCanNotVote = createMockSnsNeuron({
    id: [1],
    stake: 314000000n,
    state: NeuronState.Locked,
    dissolveDelaySeconds:
      snsNervousSystemParametersMock
        .neuron_minimum_dissolve_delay_to_vote_seconds[0] - 1n,
  });
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronVotingPowerSection, {
      props: {
        neuron,
        parameters: snsNervousSystemParametersMock,
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

  it("should render voting power", async () => {
    const po = renderComponent(neuronCanVote);
    expect(await po.getVotingPower()).toBe("5.18");
  });

  it("should render no voting power if neuron can't vote", async () => {
    const po = renderComponent(neuronCanNotVote);
    expect(await po.getVotingPower()).toBe("None");
  });

  it("should render no voting power description if neuron can't vote", async () => {
    const po = renderComponent(neuronCanNotVote);

    expect(await po.getDescription()).toBe(
      "The dissolve delay must be at least 30 days, 10 hours for the neuron to have voting power. Learn more about voting power on the dashboard."
    );
  });

  it("should render voting power description if neuron can vote", async () => {
    const po = renderComponent(neuronCanVote);

    expect(await po.getDescription()).toBe(
      "voting_power = (3.14 + 1.00) × 1.25 × 1.00 = 5.18"
    );
  });

  it("should render item actions", async () => {
    const po = renderComponent(mockSnsNeuron);

    expect(await po.hasStakeItemAction()).toBe(true);
    expect(await po.hasStateItemAction()).toBe(true);
    expect(await po.hasDissolveDelayItemActionPo()).toBe(true);
  });
});
