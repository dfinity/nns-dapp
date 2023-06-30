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
import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsNeuronVotingPower", () => {
  const now = 1686806749421;
  const nowSeconds = Math.floor(now / 1000);
  const maxDissolveDelay = 400n;
  const neuron = createMockSnsNeuron({
    stake: 2_000_000_000n,
    stakedMaturity: 800_000_000n,
    id: [1],
    state: NeuronState.Locked,
    votingPowerMultiplier: 100n,
    ageSinceSeconds: BigInt(nowSeconds) - 200n,
    dissolveDelaySeconds: maxDissolveDelay - 200n,
  });
  const parameters: SnsNervousSystemParameters = {
    ...snsNervousSystemParametersMock,
    neuron_minimum_dissolve_delay_to_vote_seconds: [100n],
    max_dissolve_delay_seconds: [maxDissolveDelay],
    max_dissolve_delay_bonus_percentage: [50n],
    max_neuron_age_for_age_bonus: [400n],
    max_age_bonus_percentage: [50n],
  };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
  });

  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronVotingPower, {
      props: {
        neuron,
        parameters,
        token: mockToken,
      },
    });

    return SnsNeuronVotingPowerPo.under(new JestPageObjectElement(container));
  };

  it("renders neuron voting power", async () => {
    const po = renderComponent(neuron);

    expect(await po.getVotingPower()).toBe("43.75");
  });

  it("shows description when info button is clicked", async () => {
    const po = renderComponent(neuron);

    await po.clickInfoIcon();

    expect(await po.getVotingPowerDescription()).toBe(
      "Calculated as: (TET staked + maturity staked) x Dissolve Delay Bonus x Age Bonus(20.00 + 8.00) x 1.25 x 1.25"
    );
  });
});
