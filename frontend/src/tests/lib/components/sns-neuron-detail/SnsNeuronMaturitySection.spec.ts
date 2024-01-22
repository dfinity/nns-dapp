import SnsNeuronMaturitySection from "$lib/components/sns-neuron-detail/SnsNeuronMaturitySection.svelte";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { SnsNeuronMaturitySectionPo } from "$tests/page-objects/SnsNeuronMaturitySection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("SnsNeuronMaturitySection", () => {
  const fee = TokenAmount.fromE8s({ amount: 10_000n, token: ICPToken });
  const mockNeuron = createMockSnsNeuron({
    id: [1],
    stakedMaturity: 100_000_000n,
    maturity: 214_000_000n,
    activeDisbursementsE8s: [200_000_000n],
  });
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronMaturitySection, {
      props: {
        neuron,
        fee,
      },
    });

    return SnsNeuronMaturitySectionPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render total maturity", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.getTotalMaturity()).toBe("5.14");
  });

  it("should render item actions", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.hasStakedMaturityItemAction()).toBe(true);
    expect(await po.hasAvailableMaturityItemAction()).toBe(true);
  });
});
