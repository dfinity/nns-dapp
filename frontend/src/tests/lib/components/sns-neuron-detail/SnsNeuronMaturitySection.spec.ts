import SnsNeuronMaturitySection from "$lib/components/sns-neuron-detail/SnsNeuronMaturitySection.svelte";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { SnsNeuronMaturitySectionPo } from "$tests/page-objects/SnsNeuronMaturitySection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./SnsNeuronContextTest.svelte";

describe("SnsNeuronMaturitySection", () => {
  const mockNeuron = createMockSnsNeuron({
    id: [1],
    stakedMaturity: 100_000_000n,
    maturity: 214_000_000n,
  });
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        passPropNeuron: true,
        rootCanisterId: mockCanisterId,
        testComponent: SnsNeuronMaturitySection,
      },
    });

    return SnsNeuronMaturitySectionPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render total maturity", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.getTotalMaturity()).toBe("3.14");
  });

  it("should render item actions", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.hasStakedMaturityItemAction()).toBe(true);
    expect(await po.hasAvailableMaturityItemAction()).toBe(true);
  });
});
