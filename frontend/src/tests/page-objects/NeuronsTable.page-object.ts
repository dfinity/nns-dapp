import { NeuronsTableRowPo } from "$tests/page-objects/NeuronsTableRow.page-object";
import { ResponsiveTablePo } from "$tests/page-objects/ResponsiveTable.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronsTablePo extends ResponsiveTablePo {
  private static readonly TID = "neurons-table-component";

  static under(element: PageObjectElement): NeuronsTablePo {
    return new NeuronsTablePo(element.byTestId(NeuronsTablePo.TID));
  }

  getNeuronsTableRowPos(): Promise<NeuronsTableRowPo[]> {
    return NeuronsTableRowPo.allUnder(this.root);
  }

  async getNeuronsTableRowPo(neuronId: string): Promise<NeuronsTableRowPo> {
    const rows = await this.getNeuronsTableRowPos();

    for (const row of rows) {
      const id = await row.getNeuronId();
      if (id === neuronId) {
        return row;
      }
    }

    throw new Error(`Neuron with id ${neuronId} not found`);
  }

  async getNeuronIds(): Promise<string[]> {
    const rows = await this.getNeuronsTableRowPos();
    return Promise.all(rows.map((row) => row.getNeuronId()));
  }
}
