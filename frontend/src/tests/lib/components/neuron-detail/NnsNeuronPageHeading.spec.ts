/**
 * @jest-environment jsdom
 */

import NnsNeuronPageHeading from "$lib/components/neuron-detail/NnsNeuronPageHeading.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronPageHeadingPo } from "$tests/page-objects/NnsNeuronPageHeading.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsNeuronPageHeading", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NnsNeuronPageHeading, { props: { neuron } });

    return NnsNeuronPageHeadingPo.under(new JestPageObjectElement(container));
  };

  it("should render the neuron's stake", async () => {
    const stake = 314_000_000n;
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: stake,
        neuronFees: 0n,
      },
    });

    expect(await po.getStake()).toEqual("3.14");
  });
});
