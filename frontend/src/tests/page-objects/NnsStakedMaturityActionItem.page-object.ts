import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsStakedMaturityActionItemPo extends BasePageObject {
  private static readonly TID = "nns-staked-maturity-item-action-component";

  static under(element: PageObjectElement): NnsStakedMaturityActionItemPo {
    return new NnsStakedMaturityActionItemPo(
      element.byTestId(NnsStakedMaturityActionItemPo.TID)
    );
  }

  getStakedMaturity(): Promise<string> {
    return this.getText("staked-maturity");
  }

  hasStakeButton(): Promise<boolean> {
    return this.getButton("stake-maturity-button").isPresent();
  }
}
