import SnsNeuronPageHeading from "$lib/components/sns-neuron-detail/SnsNeuronPageHeading.svelte";
import { SECONDS_IN_EIGHT_YEARS } from "$lib/constants/constants";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { SnsNeuronPageHeadingPo } from "$tests/page-objects/SnsNeuronPageHeading.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";

describe("SnsNeuronPageHeading", () => {
  const renderSnsNeuronCmp = (neuron: SnsNeuron) => {
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronPageHeading,
      neuron,
      reload: vi.fn(),
      props: {
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
});
