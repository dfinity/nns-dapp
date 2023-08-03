import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class StakeItemActionPo extends BasePageObject {
  private static readonly TID = "stake-item-action-component";

  static under(element: PageObjectElement): StakeItemActionPo {
    return new StakeItemActionPo(element.byTestId(StakeItemActionPo.TID));
  }

  getStake(): Promise<string> {
    return this.getText("stake-value");
  }

  getIncreaseStakeButtonPo(): ButtonPo {
    return this.getButton("increase-stake-button-component");
  }

  hasIncreaseStakeButton(): Promise<boolean> {
    return this.getIncreaseStakeButtonPo().isPresent();
  }

  clickIncrease(): Promise<void> {
    return this.getIncreaseStakeButtonPo().click();
  }
}
