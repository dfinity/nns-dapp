import NnsNeuronMaturitySection from "$lib/components/neuron-detail/NnsNeuronMaturitySection.svelte";
import NeuronContextActionsTest from "$tests/lib/components/neuron-detail/NeuronContextActionsTest.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronMaturitySectionPo } from "$tests/page-objects/NnsNeuronMaturitySection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsNeuronMaturitySection", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronMaturitySection,
      },
    });

    return NnsNeuronMaturitySectionPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render total maturity", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        maturityE8sEquivalent: 100_000_000n,
        stakedMaturityE8sEquivalent: 214_000_000n,
      },
    };
    const po = renderComponent(neuron);

    expect(await po.getTotalMaturity()).toBe("3.14");
  });

  it("should render item actions", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.hasStakedMaturityItemAction()).toBe(true);
    expect(await po.hasAvailableMaturityItemAction()).toBe(true);
  });
});
