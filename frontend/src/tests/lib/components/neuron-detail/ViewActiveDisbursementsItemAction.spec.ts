import ViewActiveDisbursementsItemAction from "$lib/components/neuron-detail/ViewActiveDisbursementsItemAction.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { ViewActiveDisbursementsItemActionPo } from "$tests/page-objects/ViewActiveDisbursementsItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@icp-sdk/canisters/nns";
import { render } from "@testing-library/svelte";

describe("ViewActiveDisbursementsItemAction", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(ViewActiveDisbursementsItemAction, {
      props: {
        neuron,
      },
    });

    return ViewActiveDisbursementsItemActionPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should not render components when no disbursements available", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        maturityDisbursementsInProgress: [],
      },
    });

    expect(await po.isPresent()).toBe(false);
  });

  it("should render disbursement with total amount", async () => {
    const disbursementAmount1 = 100_000_000n; // 1.00 ICP
    const disbursementAmount2 = 200_000_000n; // 2.00 ICP
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        maturityDisbursementsInProgress: [
          {
            amountE8s: disbursementAmount1,
            timestampOfDisbursementSeconds: undefined,
            accountToDisburseTo: undefined,
            accountIdentifierToDisburseTo: undefined,
            finalizeDisbursementTimestampSeconds: undefined,
          },
          {
            amountE8s: disbursementAmount2,
            timestampOfDisbursementSeconds: undefined,
            accountToDisburseTo: undefined,
            accountIdentifierToDisburseTo: undefined,
            finalizeDisbursementTimestampSeconds: undefined,
          },
        ],
      },
    });

    expect(await po.isPresent()).toBe(true);
    expect(await po.getDisbursementTotal()).toBe("3.00");
  });
});
