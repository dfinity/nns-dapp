import NnsNeuronVotingPowerSection from "$lib/components/neuron-detail/NnsNeuronVotingPowerSection.svelte";
import { SECONDS_IN_HALF_YEAR } from "$lib/constants/constants";
import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
import { networkEconomicsStore } from "$lib/stores/network-economics.store";
import NeuronContextActionsTest from "$tests/lib/components/neuron-detail/NeuronContextActionsTest.svelte";
import { mockNetworkEconomics } from "$tests/mocks/network-economics.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronVotingPowerSectionPo } from "$tests/page-objects/NnsNeuronVotingPowerSection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsStakeItemAction", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronVotingPowerSection,
      },
    });

    return NnsNeuronVotingPowerSectionPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render voting power", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      decidingVotingPower: 614000000n,
      potentialVotingPower: 614000000n,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE),
    };
    const po = renderComponent(neuron);

    expect(await po.getVotingPower()).toBe("6.14");
  });

  it("should render no voting power if neuron can't vote", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      decidingVotingPower: 614000000n,
      potentialVotingPower: 614000000n,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE - 1),
    };
    const po = renderComponent(neuron);

    expect(await po.getVotingPower()).toBe("None");
  });

  it("should render description with no voting power explanation", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      decidingVotingPower: 614000000n,
      potentialVotingPower: 614000000n,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE - 1),
    };
    const po = renderComponent(neuron);

    expect(await po.getDescription()).toBe(
      "The dissolve delay must be at least 6 months for the neuron to have voting power. Learn more about voting power on the dashboard."
    );
  });

  it("should render description with voting power explanation including activity multiplier", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      decidingVotingPower: 614000000n,
      potentialVotingPower: 614000000n,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE),
    };
    const po = renderComponent(neuron);

    expect(await po.getGenericDescription()).toBe(
      "voting_power = (staked_amount + staked_maturity) × (1 + age_bonus) × (1 + dissolve_delay_bonus) × activity_multiplier"
    );
  });

  it("should render description with voting power calculation including activity multiplier", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE),
      decidingVotingPower: 307000000n,
      potentialVotingPower: 614000000n,
      fullNeuron: {
        ...mockFullNeuron,
        decidingVotingPower: 307000000n,
        potentialVotingPower: 614000000n,
      },
    };
    const po = renderComponent(neuron);

    expect(await po.getDescription()).toBe(
      "voting_power = (30.00 + 0) × 1.00 × 1.06 × 0.50 = 3.07"
    );
  });

  it("should render item actions", async () => {
    const po = renderComponent({
      ...mockNeuron,
      dissolveDelaySeconds: BigInt(SECONDS_IN_HALF_YEAR),
    });

    expect(await po.hasStakeItemAction()).toBe(true);
    expect(await po.hasNeuronStateItemAction()).toBe(true);
    expect(await po.hasNeuronDissolveDelayItemAction()).toBe(true);
  });

  it("should render reward status item action when flag enabled", async () => {
    networkEconomicsStore.setParameters({
      parameters: mockNetworkEconomics,
      certified: true,
    });
    const po = renderComponent({
      ...mockNeuron,
      dissolveDelaySeconds: BigInt(SECONDS_IN_HALF_YEAR),
    });

    expect(await po.getNnsNeuronRewardStatusActionPo().isPresent()).toBe(true);
  });

  it("should render voting power w/o extra class when not reduced voting power", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE),
      decidingVotingPower: 614000000n,
      potentialVotingPower: 614000000n,
      fullNeuron: {
        ...mockFullNeuron,
        decidingVotingPower: 614000000n,
        potentialVotingPower: 614000000n,
      },
    };
    const po = renderComponent(neuron);

    expect(await po.isReducedVotingPowerStyle()).toBe(false);
  });

  it("should render voting power with isReducedVotingPower class when reduced voting power", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE),
      decidingVotingPower: 307000000n,
      potentialVotingPower: 614000000n,
      fullNeuron: {
        ...mockFullNeuron,
        decidingVotingPower: 307000000n,
        potentialVotingPower: 614000000n,
      },
    };
    const po = renderComponent(neuron);

    expect(await po.isReducedVotingPowerStyle()).toBe(true);
  });
});
