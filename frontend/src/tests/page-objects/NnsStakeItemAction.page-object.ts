import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsStakeItemActionPo extends BasePageObject {
  private static readonly TID = "nns-stake-item-action-component";

  static under(element: PageObjectElement): NnsStakeItemActionPo {
    return new NnsStakeItemActionPo(element.byTestId(NnsStakeItemActionPo.TID));
  }

  getStake(): Promise<string> {
    return this.getText("stake-value");
  }

  hasIncreaseStakeButton(): Promise<boolean> {
    return this.getButton("nns-increase-stake-button-component").isPresent();
  }
}
