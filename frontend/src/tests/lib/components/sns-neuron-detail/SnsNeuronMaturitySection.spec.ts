import SnsNeuronMaturitySection from "$lib/components/sns-neuron-detail/SnsNeuronMaturitySection.svelte";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { SnsNeuronMaturitySectionPo } from "$tests/page-objects/SnsNeuronMaturitySection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import { TokenAmountV2 } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("SnsNeuronMaturitySection", () => {
  const tokenSymbol = "BLOB";
  const token = {
    ...mockSnsToken,
    symbol: tokenSymbol,
  };
  const fee = TokenAmountV2.fromUlps({ amount: 10_000n, token });
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
        token,
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

  it("should render the token in the available maturity tooltip", async () => {
    const po = renderComponent(mockNeuron);

    expect(
      await po.getAvailableMaturityItemActionPo().getTooltipIconPo().getText()
    ).toBe(
      "Available maturity can be staked, or burned to disburse an amount of BLOB that is subject to a non-deterministic process, called maturity modulation."
    );
  });
});
