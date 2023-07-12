/**
 * @jest-environment jsdom
 */

import NnsNeuronPageHeader from "$lib/components/neuron-detail/NnsNeuronPageHeader.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronPageHeaderPo } from "$tests/page-objects/NnsNeuronPageHeader.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsNeuronPageHeader", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NnsNeuronPageHeader, { props: { neuron } });

    return NnsNeuronPageHeaderPo.under(new JestPageObjectElement(container));
  };

  it("should render the NNS universe", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.getUniverse()).toEqual("Internet Computer");
  });

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
