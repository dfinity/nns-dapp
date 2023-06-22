import { KeyValuePairPo } from "$tests/page-objects/KeyValuePair.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronVestingPeriodRemainingPo extends BasePageObject {
  static readonly TID = "sns-vesting-period-remaining-component";

  static under(element: PageObjectElement): SnsNeuronVestingPeriodRemainingPo {
    return new SnsNeuronVestingPeriodRemainingPo(
      element.byTestId(SnsNeuronVestingPeriodRemainingPo.TID)
    );
  }

  getKeyValuePairPo(): KeyValuePairPo {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "sns-neuron-vesting-period",
    });
  }

  getVestingPeriod(): Promise<string> {
    return this.getKeyValuePairPo().getValueText();
  }

  vestingPeriodIsPresent(): Promise<boolean> {
    return this.getKeyValuePairPo().isPresent();
  }
}
