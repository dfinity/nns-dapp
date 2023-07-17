import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { NnsStakedMaturityActionItemPo } from "./NnsStakedMaturityActionItem.page-object";

export class NnsNeuronMaturitySectionPo extends BasePageObject {
  private static readonly TID = "nns-neuron-maturity-section-component";

  static under(element: PageObjectElement): NnsNeuronMaturitySectionPo {
    return new NnsNeuronMaturitySectionPo(
      element.byTestId(NnsNeuronMaturitySectionPo.TID)
    );
  }

  getTotalMaturity(): Promise<string> {
    return this.getText("total-maturity");
  }

  getStakedMaturityItemActionPo(): NnsStakedMaturityActionItemPo {
    return NnsStakedMaturityActionItemPo.under(this.root);
  }

  hasStakedMaturityItemAction(): Promise<boolean> {
    return this.getStakedMaturityItemActionPo().isPresent();
  }
}
