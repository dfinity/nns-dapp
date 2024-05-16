import NeuronsTable from "$lib/components/neurons/NeuronsTable/NeuronsTable.svelte";
import type { TableNeuron } from "$lib/types/neurons-table";
import { NeuronsTablePo } from "$tests/page-objects/NeuronsTable.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

describe("NeuronsTable", () => {
  const neuron1: TableNeuron = {
    neuronId: 10n,
  };
  const neuron2: TableNeuron = {
    neuronId: 99n,
  };
  const renderComponent = () => {
    const { container } = render(NeuronsTable, {
      neurons: [neuron1, neuron2],
    });
    return NeuronsTablePo.under(new JestPageObjectElement(container));
  };

  it("should render neurons", async () => {
    const po = renderComponent();
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getNeuronId()).toBe(neuron1.neuronId.toString());
    expect(await rowPos[1].getNeuronId()).toBe(neuron2.neuronId.toString());
  });
});
