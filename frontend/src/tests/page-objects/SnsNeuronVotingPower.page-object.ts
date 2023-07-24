import { KeyValuePairInfoPo } from "$tests/page-objects/KeyValuePairInfo.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronVotingPowerPo extends BasePageObject {
  static readonly TID = "sns-voting-power-component";

  static under(element: PageObjectElement): SnsNeuronVotingPowerPo {
    return new SnsNeuronVotingPowerPo(
      element.byTestId(SnsNeuronVotingPowerPo.TID)
    );
  }

  getKeyValuePairPo(): KeyValuePairInfoPo {
    return KeyValuePairInfoPo.under({
      element: this.root,
      testId: "sns-voting-power",
    });
  }

  getVotingPower(): Promise<string> {
    return this.getKeyValuePairPo().getValueText();
  }

  clickInfoIcon(): Promise<void> {
    return this.getKeyValuePairPo().clickInfoIcon();
  }

  getVotingPowerDescription(): Promise<string> {
    return this.getKeyValuePairPo().getDescriptionText();
  }
}
