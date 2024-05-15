import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronsTableRowPo extends BasePageObject {
  private static readonly TID = "neurons-table-row-component";

  static under(element: PageObjectElement): NeuronsTableRowPo {
    return new NeuronsTableRowPo(element.byTestId(NeuronsTableRowPo.TID));
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<NeuronsTableRowPo[]> {
    return Array.from(await element.allByTestId(NeuronsTableRowPo.TID)).map(
      (el) => new NeuronsTableRowPo(el)
    );
  }

  getNeuronId(): Promise<string> {
    return this.getText("neuron-id");
  }
}
