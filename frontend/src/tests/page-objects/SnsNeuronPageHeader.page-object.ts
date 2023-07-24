import { UniversePageSummaryPo } from "$tests/page-objects/UniversePageSummary.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronPageHeaderPo extends BasePageObject {
  private static readonly TID = "sns-neuron-page-header-component";

  static under(element: PageObjectElement): SnsNeuronPageHeaderPo {
    return new SnsNeuronPageHeaderPo(
      element.byTestId(SnsNeuronPageHeaderPo.TID)
    );
  }

  getUniversePageSummaryPo(): UniversePageSummaryPo {
    return UniversePageSummaryPo.under(this.root);
  }

  getUniverse(): Promise<string> {
    return this.getUniversePageSummaryPo().getTitle();
  }
}
