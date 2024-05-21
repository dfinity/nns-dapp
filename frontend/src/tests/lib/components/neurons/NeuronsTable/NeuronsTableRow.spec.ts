import NeuronsTableRow from "$lib/components/neurons/NeuronsTable/NeuronsTableRow.svelte";
import type { TableNeuron } from "$lib/types/neurons-table";
import { NeuronsTableRowPo } from "$tests/page-objects/NeuronsTableRow.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

describe("NeuronsTableRow", () => {
  const neuron: TableNeuron = {
    neuronId: 10n,
  };
  const renderComponent = () => {
    const { container } = render(NeuronsTableRow, {
      neuron,
    });
    return NeuronsTableRowPo.under(new JestPageObjectElement(container));
  };

  it("should render table row", async () => {
    const po = renderComponent();
    expect(await po.getNeuronId()).toBe(neuron.neuronId.toString());
  });
});
