/**
 * @jest-environment jsdom
 */

import SnsNeuronPageHeading from "$lib/components/sns-neuron-detail/SnsNeuronPageHeading.svelte";
import { SECONDS_IN_EIGHT_YEARS } from "$lib/constants/constants";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { SnsNeuronPageHeadingPo } from "$tests/page-objects/SnsNeuronPageHeading.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsNeuronPageHeading", () => {
  const renderSnsNeuronCmp = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronPageHeading, {
      props: {
        neuron,
        parameters: snsNervousSystemParametersMock,
      },
    });

    return SnsNeuronPageHeadingPo.under(new JestPageObjectElement(container));
  };

  it("should render the neuron's stake", async () => {
    const stake = 314_000_000n;
    const po = renderSnsNeuronCmp({
      ...mockSnsNeuron,
      cached_neuron_stake_e8s: stake,
    });

    expect(await po.getStake()).toEqual("3.14");
  });

  it("should render the neuron's voting power", async () => {
    const stake = 314_000_000n;
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Locked,
      dissolveDelaySeconds: BigInt(SECONDS_IN_EIGHT_YEARS),
      stakedMaturity: 100_000_000n,
      stake,
    });
    const po = renderSnsNeuronCmp(neuron);

    expect(await po.getVotingPower()).toEqual("Voting Power: 5.59");
  });

  it("should render no votig power if neuron can't vote", async () => {
    const stake = 314_000_000n;
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Locked,
      dissolveDelaySeconds:
        snsNervousSystemParametersMock
          .neuron_minimum_dissolve_delay_to_vote_seconds[0] - 100n,
      stake,
    });
    const po = renderSnsNeuronCmp(neuron);

    expect(await po.getVotingPower()).toEqual("No Voting Power");
  });
});
