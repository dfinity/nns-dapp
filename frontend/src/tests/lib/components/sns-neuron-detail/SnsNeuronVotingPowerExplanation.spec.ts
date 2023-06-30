/**
 * @jest-environment jsdom
 */

import SnsNeuronVotingPowerExplanation from "$lib/components/sns-neuron-detail/SnsNeuronVotingPowerExplanation.svelte";
import {
  createMockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { SnsNeuronVotingPowerExplanationPo } from "$tests/page-objects/SnsNeuronVotingPowerExplanation.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsNeuronVotingPowerExplanation", () => {
  const now = 1686806749421;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
  });

  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronVotingPowerExplanation, {
      props: {
        neuron,
        parameters: snsNervousSystemParametersMock,
        token: mockToken,
      },
    });

    return SnsNeuronVotingPowerExplanationPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("renders neuron voting power explanation", async () => {
    const neuron = createMockSnsNeuron({
      stake: 2_000_000_000n,
      id: [1],
      state: NeuronState.Locked,
    });
    const po = renderComponent(neuron);

    expect(await po.getText()).toBe(
      "Calculated as: (TET staked + maturity staked) x Dissolve Delay Bonus x Age Bonus(20.00 + 0.00000002) x 1.02 x 1.25"
    );
  });

  it("shows explanation with voting power multiplier", async () => {
    const neuron = createMockSnsNeuron({
      stake: 2_000_000_000n,
      id: [1],
      state: NeuronState.Locked,
      votingPowerMultiplier: 50n,
    });
    const po = renderComponent(neuron);

    expect(await po.getText()).toBe(
      "Calculated as: (TET staked + maturity staked) x Dissolve Delay Bonus x Age Bonus x Voting Power Multiplier(20.00 + 0.00000002) x 1.02 x 1.25 x 0.50"
    );
  });
});
