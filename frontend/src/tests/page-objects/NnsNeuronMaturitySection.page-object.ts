import { NnsAvailableMaturityItemActionPo } from "$tests/page-objects/NnsAvailableMaturityItemAction.page-object";
import { NnsStakedMaturityItemActionPo } from "$tests/page-objects/NnsStakedMaturityItemAction.page-object";
import { ViewActiveDisbursementsItemActionPo } from "$tests/page-objects/ViewActiveDisbursementsItemAction.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

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
    return NnsStakedMaturityItemActionPo.under(this.root);
  }

  hasStakedMaturityItemAction(): Promise<boolean> {
    return this.getStakedMaturityItemActionPo().isPresent();
  }

  getAvailableMaturityItemActionPo(): NnsAvailableMaturityItemActionPo {
    return NnsAvailableMaturityItemActionPo.under(this.root);
  }

  hasAvailableMaturityItemAction(): Promise<boolean> {
    return this.getAvailableMaturityItemActionPo().isPresent();
  }

  getViewActiveDisbursementsItemActionPo(): ViewActiveDisbursementsItemActionPo {
    return ViewActiveDisbursementsItemActionPo.under(this.root);
  }

  hasViewActiveDisbursementsItemAction(): Promise<boolean> {
    return this.getViewActiveDisbursementsItemActionPo().isPresent();
  }
}
