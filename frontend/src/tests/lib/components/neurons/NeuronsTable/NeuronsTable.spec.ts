import NeuronsTable from "$lib/components/neurons/NeuronsTable/NeuronsTable.svelte";
import type { TableNeuron } from "$lib/types/neurons-table";
import { NeuronsTablePo } from "$tests/page-objects/NeuronsTable.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";

describe("NeuronsTable", () => {
  const neuron1: TableNeuron = {
    rowHref: "/neurons/10",
    domKey: "10",
    neuronId: "10",
    stake: TokenAmountV2.fromUlps({
      amount: 500_000_000n,
      token: ICPToken,
    }),
  };
  const neuron2: TableNeuron = {
    rowHref: "/neurons/99",
    domKey: "99",
    neuronId: "99",
    stake: TokenAmountV2.fromUlps({
      amount: 1_300_000_000n,
      token: ICPToken,
    }),
  };
  const renderComponent = () => {
    const { container } = render(NeuronsTable, {
      neurons: [neuron1, neuron2],
    });
    return NeuronsTablePo.under(new JestPageObjectElement(container));
  };

  it("should render neuron URL", async () => {
    const po = renderComponent();
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getHref()).toBe(neuron1.rowHref);
    expect(await rowPos[1].getHref()).toBe(neuron2.rowHref);
  });

  it("should render neuron ID", async () => {
    const po = renderComponent();
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getNeuronId()).toBe(neuron1.neuronId);
    expect(await rowPos[1].getNeuronId()).toBe(neuron2.neuronId);
  });

  it("should render neuron stake", async () => {
    const po = renderComponent();
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getStake()).toBe("5.00 ICP");
    expect(await rowPos[1].getStake()).toBe("13.00 ICP");
  });
});
