import NnsNeuronMaturitySection from "$lib/components/neuron-detail/NnsNeuronMaturitySection.svelte";
import NeuronContextActionsTest from "$tests/lib/components/neuron-detail/NeuronContextActionsTest.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronMaturitySectionPo } from "$tests/page-objects/NnsNeuronMaturitySection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@icp-sdk/canisters/nns";
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

  it("should render active disbursements item action when maturity disbursement in progress", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        maturityDisbursementsInProgress: [
          {
            amountE8s: 200_000_000n,
            timestampOfDisbursementSeconds: undefined,
            accountToDisburseTo: undefined,
            finalizeDisbursementTimestampSeconds: undefined,
            accountIdentifierToDisburseTo: undefined,
          },
        ],
      },
    };
    const po = renderComponent(neuron);

    expect(await po.getViewActiveDisbursementsItemActionPo().isPresent()).toBe(
      true
    );
    expect(
      await po.getViewActiveDisbursementsItemActionPo().getDisbursementTotal()
    ).toBe("2.00");
  });
});
