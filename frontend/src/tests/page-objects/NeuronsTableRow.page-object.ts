import { ResponsiveTableRowPo } from "$tests/page-objects/ResponsiveTableRow.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronsTableRowPo extends ResponsiveTableRowPo {
  static under(element: PageObjectElement): NeuronsTableRowPo {
    return new NeuronsTableRowPo(element.byTestId(ResponsiveTableRowPo.TID));
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<NeuronsTableRowPo[]> {
    return Array.from(await element.allByTestId(ResponsiveTableRowPo.TID)).map(
      (el) => new NeuronsTableRowPo(el)
    );
  }

  getNeuronId(): Promise<string> {
    return this.getText("neuron-id-cell-component");
  }

  getStake(): Promise<string> {
    return this.getText("neuron-stake-cell-component");
  }
}
