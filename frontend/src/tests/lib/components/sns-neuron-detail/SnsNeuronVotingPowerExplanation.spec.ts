import SnsNeuronVotingPowerExplanation from "$lib/components/sns-neuron-detail/SnsNeuronVotingPowerExplanation.svelte";
import {
  createMockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { SnsNeuronVotingPowerExplanationPo } from "$tests/page-objects/SnsNeuronVotingPowerExplanation.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState } from "@dfinity/nns";
import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";

describe("SnsNeuronVotingPowerExplanation", () => {
  const now = 1686806749421;
  const nowSeconds = Math.floor(now / 1000);
  const maxDissolveDelay = 400n;
  const parameters: SnsNervousSystemParameters = {
    ...snsNervousSystemParametersMock,
    neuron_minimum_dissolve_delay_to_vote_seconds: [100n],
    max_dissolve_delay_seconds: [maxDissolveDelay],
    max_dissolve_delay_bonus_percentage: [50n],
    max_neuron_age_for_age_bonus: [400n],
    max_age_bonus_percentage: [50n],
  };

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(now);
  });

  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronVotingPowerExplanation, {
      props: {
        neuron,
        parameters,
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
      stakedMaturity: 800_000_000n,
      id: [1],
      state: NeuronState.Locked,
      ageSinceSeconds: BigInt(nowSeconds) - 200n,
      dissolveDelaySeconds: maxDissolveDelay - 200n,
      votingPowerMultiplier: 100n,
    });
    const po = renderComponent(neuron);

    expect(await po.getText()).toBe(
      "Calculated as: (TET staked + maturity staked) x Dissolve Delay Bonus x Age Bonus(20.00 + 8.00) x 1.25 x 1.25"
    );
  });

  it("shows explanation with voting power multiplier", async () => {
    const neuron = createMockSnsNeuron({
      stake: 2_000_000_000n,
      stakedMaturity: 800_000_000n,
      id: [1],
      state: NeuronState.Locked,
      ageSinceSeconds: BigInt(nowSeconds) - 200n,
      dissolveDelaySeconds: maxDissolveDelay - 200n,
      votingPowerMultiplier: 50n,
    });
    const po = renderComponent(neuron);

    expect(await po.getText()).toBe(
      "Calculated as: (TET staked + maturity staked) x Dissolve Delay Bonus x Age Bonus x Voting Power Multiplier(20.00 + 8.00) x 1.25 x 1.25 x 0.50"
    );
  });
});
