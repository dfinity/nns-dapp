/**
 * @jest-environment jsdom
 */

import NnsNeuronVotingPowerSection from "$lib/components/neuron-detail/NnsNeuronVotingPowerSection.svelte";
import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronVotingPowerSectionPo } from "$tests/page-objects/NnsNeuronVotingPowerSection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

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
      votingPower: 614000000n,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE + 100),
    };
    const po = renderComponent(neuron);

    expect(await po.getVotingPower()).toBe("6.14");
  });

  it("should render no voting power if neuron can't vote", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      votingPower: 614000000n,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE - 100),
    };
    const po = renderComponent(neuron);

    expect(await po.getVotingPower()).toBe("None");
  });

  it("should render description with no voting power explanation", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      votingPower: 614000000n,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE - 100),
    };
    const po = renderComponent(neuron);

    expect(await po.getDescription()).toBe(
      "The dissolve delay must be greater than 6 months for the neuron to have voting power. Learn more about voting power on the dashboard."
    );
  });

  it("should render description with voting power calculation", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      votingPower: 614000000n,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE + 100),
    };
    const po = renderComponent(neuron);

    expect(await po.getDescription()).toBe(
      "It is determined by the stake, state and dissolve delay. Calculated as: (neuron_stake + staked_maturity) × age_bonus × dissolved_delay_bonus = (30.00 + 0) × 1.00 × 1.06 = 6.14."
    );
  });

  it("should render item actions", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.hasStakeItemAction()).toBe(true);
    expect(await po.hasNeuronStateItemAction()).toBe(true);
    expect(await po.hasNeuronDissolveDelayItemAction()).toBe(true);
  });
});
