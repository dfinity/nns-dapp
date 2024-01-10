import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { SnsAvailableMaturityItemActionPo } from "./SnsAvailableMaturityItemAction.page-object";
import { SnsStakedMaturityItemActionPo } from "./SnsStakedMaturityItemAction.page-object";

export class SnsNeuronMaturitySectionPo extends BasePageObject {
  private static readonly TID = "sns-neuron-maturity-section-component";

  static under(element: PageObjectElement): SnsNeuronMaturitySectionPo {
    return new SnsNeuronMaturitySectionPo(
      element.byTestId(SnsNeuronMaturitySectionPo.TID)
    );
  }

  getTotalMaturity(): Promise<string> {
    return this.getText("total-maturity");
  }

  getStakedMaturityItemActionPo(): SnsStakedMaturityItemActionPo {
    return SnsStakedMaturityItemActionPo.under(this.root);
  }

  hasStakedMaturityItemAction(): Promise<boolean> {
    return this.getStakedMaturityItemActionPo().isPresent();
  }

  getAvailableMaturityItemActionPo(): SnsAvailableMaturityItemActionPo {
    return SnsAvailableMaturityItemActionPo.under(this.root);
  }

  hasAvailableMaturityItemAction(): Promise<boolean> {
    return this.getAvailableMaturityItemActionPo().isPresent();
  }
}
