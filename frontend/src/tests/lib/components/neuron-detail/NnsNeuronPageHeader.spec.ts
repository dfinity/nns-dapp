import NnsNeuronPageHeader from "$lib/components/neuron-detail/NnsNeuronPageHeader.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronPageHeaderPo } from "$tests/page-objects/NnsNeuronPageHeader.page-object";
import { VitestPageObjectElement } from "$tests/page-objects/vitest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsNeuronPageHeader", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NnsNeuronPageHeader, { props: { neuron } });

    return NnsNeuronPageHeaderPo.under(new VitestPageObjectElement(container));
  };

  it("should render the NNS universe name", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.getUniverse()).toEqual("Internet Computer");
  });
});
