import NnsNeuronVotingPowerSection from "$lib/components/neuron-detail/NnsNeuronVotingPowerSection.svelte";
import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import NeuronContextActionsTest from "$tests/lib/components/neuron-detail/NeuronContextActionsTest.svelte";
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

  it("should render description with voting power explanation", async () => {
    overrideFeatureFlagsStore.setFlag(
      "ENABLE_PERIODIC_FOLLOWING_CONFIRMATION",
      false
    );
    const neuron: NeuronInfo = {
      ...mockNeuron,
      decidingVotingPower: 614000000n,
      potentialVotingPower: 614000000n,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE),
    };
    const po = renderComponent(neuron);

    expect(await po.getGenericDescription()).toBe(
      "voting_power = (staked_amount + staked_maturity) × (1 + age_bonus) × (1 + dissolve_delay_bonus)"
    );
  });

  it("should render description with voting power explanation including activity multiplier", async () => {
    overrideFeatureFlagsStore.setFlag(
      "ENABLE_PERIODIC_FOLLOWING_CONFIRMATION",
      true
    );
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

  it("should render description with voting power calculation", async () => {
    overrideFeatureFlagsStore.setFlag(
      "ENABLE_PERIODIC_FOLLOWING_CONFIRMATION",
      false
    );
    const neuron: NeuronInfo = {
      ...mockNeuron,
      decidingVotingPower: 614000000n,
      potentialVotingPower: 614000000n,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE),
    };
    const po = renderComponent(neuron);

    expect(await po.getDescription()).toBe(
      "voting_power = (30.00 + 0) × 1.00 × 1.06 = 6.14"
    );
  });

  it("should render description with voting power calculation including activity multiplier", async () => {
    overrideFeatureFlagsStore.setFlag(
      "ENABLE_PERIODIC_FOLLOWING_CONFIRMATION",
      true
    );
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
    const po = renderComponent(mockNeuron);

    expect(await po.hasStakeItemAction()).toBe(true);
    expect(await po.hasNeuronStateItemAction()).toBe(true);
    expect(await po.hasNeuronDissolveDelayItemAction()).toBe(true);
  });

  it("should render reward status item action when flag enabled", async () => {
    overrideFeatureFlagsStore.setFlag(
      "ENABLE_PERIODIC_FOLLOWING_CONFIRMATION",
      true
    );
    const po = renderComponent(mockNeuron);

    expect(await po.getNnsNeuronRewardStatusActionPo().isPresent()).toBe(true);
  });

  it("should not render reward status item action when flag disabled", async () => {
    overrideFeatureFlagsStore.setFlag(
      "ENABLE_PERIODIC_FOLLOWING_CONFIRMATION",
      false
    );
    const po = renderComponent(mockNeuron);

    expect(await po.getNnsNeuronRewardStatusActionPo().isPresent()).toBe(false);
  });
});
