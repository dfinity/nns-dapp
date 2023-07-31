import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import type { ButtonPo } from "./Button.page-object";

export class SnsStakeItemActionPo extends BasePageObject {
  private static readonly TID = "sns-stake-item-action-component";

  static under(element: PageObjectElement): SnsStakeItemActionPo {
    return new SnsStakeItemActionPo(element.byTestId(SnsStakeItemActionPo.TID));
  }

  getStake(): Promise<string> {
    return this.getText("stake-value");
  }

  getIncreaseStakeButtonPo(): ButtonPo {
    return this.getButton("sns-increase-stake");
  }

  hasIncreaseStakeButton(): Promise<boolean> {
    return this.getIncreaseStakeButtonPo().isPresent();
  }

  clickIncrease(): Promise<void> {
    return this.getIncreaseStakeButtonPo().click();
  }
}
