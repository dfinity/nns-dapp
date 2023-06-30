/**
 * @jest-environment jsdom
 */

import SnsNeuronVotingPower from "$lib/components/sns-neuron-detail/SnsNeuronVotingPower.svelte";
import {
  createMockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { SnsNeuronVotingPowerPo } from "$tests/page-objects/SnsNeuronVotingPower.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsNeuronVotingPower", () => {
  const now = 1686806749421;
  const neuron = createMockSnsNeuron({
    stake: 2_000_000_000n,
    id: [1],
    state: NeuronState.Locked,
  });

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
  });

  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronVotingPower, {
      props: {
        neuron,
        parameters: snsNervousSystemParametersMock,
        token: mockToken,
      },
    });

    return SnsNeuronVotingPowerPo.under(new JestPageObjectElement(container));
  };

  it("renders neuron voting power", async () => {
    const po = renderComponent(neuron);

    expect(await po.getVotingPower()).toBe("25.50");
  });

  it("shows description when info button is clicked", async () => {
    const po = renderComponent(neuron);

    await po.clickInfoIcon();

    expect(await po.getVotingPowerDescription()).toBe(
      "Calculated as: (TET staked + maturity staked) x Dissolve Delay Bonus x Age Bonus(20.00 + 0.00000002) x 1.02 x 1.25"
    );
  });
});
