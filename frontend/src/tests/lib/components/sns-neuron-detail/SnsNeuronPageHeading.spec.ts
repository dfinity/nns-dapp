import SnsNeuronPageHeading from "$lib/components/sns-neuron-detail/SnsNeuronPageHeading.svelte";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { SnsNeuronPageHeadingPo } from "$tests/page-objects/SnsNeuronPageHeading.page-object";
import { VitestPageObjectElement } from "$tests/page-objects/vitest.page-object";
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

    return SnsNeuronPageHeadingPo.under(new VitestPageObjectElement(container));
  };

  it("should render the neuron's stake", async () => {
    const stake = 314_000_000n;
    const po = renderSnsNeuronCmp({
      ...mockSnsNeuron,
      cached_neuron_stake_e8s: stake,
    });

    expect(await po.getStake()).toEqual("3.14");
  });
});
