import { KeyValuePairInfoPo } from "$tests/page-objects/KeyValuePairInfo.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronMaturityCardPo extends BasePageObject {
  private static readonly TID = "nns-neuron-maturity-card-component";

  static under(element: PageObjectElement): NnsNeuronMaturityCardPo {
    return new NnsNeuronMaturityCardPo(
      element.byTestId(NnsNeuronMaturityCardPo.TID)
    );
  }

  getLastDistributionPo(): KeyValuePairInfoPo {
    return KeyValuePairInfoPo.under({
      element: this.root,
      testId: "last-distribution-maturity",
    });
  }

  getLastDistributionMaturity(): Promise<string> {
    return this.getLastDistributionPo().getValueText();
  }

  getLastDistributionMaturityDescription(): Promise<string> {
    return this.getLastDistributionPo().getDescriptionText();
  }
}
