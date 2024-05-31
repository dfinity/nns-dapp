import { BasePageObject } from "$tests/page-objects/base.page-object";
import { IdentifierHashPo } from "$tests/page-objects/IdentifierHash.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronIdCellPo extends BasePageObject {
  private static readonly TID = "neuron-id-cell-component";

  static under(element: PageObjectElement): NeuronIdCellPo {
    return new NeuronIdCellPo(element.byTestId(NeuronIdCellPo.TID));
  }

  getIdentifierHashPo(): IdentifierHashPo {
    return IdentifierHashPo.under(this.root);
  }

  getNeurondId(): Promise<string> {
    return this.getIdentifierHashPo().getFullText();
  }
}
