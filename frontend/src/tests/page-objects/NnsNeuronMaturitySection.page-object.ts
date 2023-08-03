import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { NnsAvailableMaturityItemActionPo } from "./NnsAvailableMaturityItemAction.page-object";
import { NnsStakedMaturityItemActionPo } from "./NnsStakedMaturityItemAction.page-object";

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

  getStakedMaturityItemActionPo(): NnsStakedMaturityItemActionPo {
    return NnsStakedMaturityItemActionPo.under({ element: this.root });
  }

  hasStakedMaturityItemAction(): Promise<boolean> {
    return this.getStakedMaturityItemActionPo().isPresent();
  }

  getAvailableMaturityItemActionPo(): NnsAvailableMaturityItemActionPo {
    return NnsAvailableMaturityItemActionPo.under({ element: this.root });
  }

  hasAvailableMaturityItemAction(): Promise<boolean> {
    return this.getAvailableMaturityItemActionPo().isPresent();
  }
}
