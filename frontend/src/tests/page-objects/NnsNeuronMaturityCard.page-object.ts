import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { KeyValuePairPo } from "./KeyValuePair.page-object";

export class NnsNeuronMaturityCardPo extends BasePageObject {
  private static readonly TID = "nns-neuron-maturity-card-component";

  static under(element: PageObjectElement): NnsNeuronMaturityCardPo {
    return new NnsNeuronMaturityCardPo(
      element.byTestId(NnsNeuronMaturityCardPo.TID)
    );
  }

  getLastDistributionPo(): KeyValuePairPo {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "last-distribution-maturity",
    });
  }

  getLastDistributionMaturity(): Promise<string> {
    return this.getLastDistributionPo().getValueText();
  }
}
