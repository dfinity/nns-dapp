import { UniversePageSummaryPo } from "$tests/page-objects/UniversePageSummary.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronPageHeaderPo extends BasePageObject {
  private static readonly TID = "nns-neuron-page-header-component";

  static under(element: PageObjectElement): NnsNeuronPageHeaderPo {
    return new NnsNeuronPageHeaderPo(
      element.byTestId(NnsNeuronPageHeaderPo.TID)
    );
  }

  getUniversePageSummaryPo(): UniversePageSummaryPo {
    return UniversePageSummaryPo.under(this.root);
  }

  getUniverse(): Promise<string> {
    return this.getUniversePageSummaryPo().getTitle();
  }

  getNeuronId(): Promise<string> {
    return this.root.byTestId("identifier").getText();
  }
}
