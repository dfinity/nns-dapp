import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AmountWithUsdPo extends BasePageObject {
  private static readonly TID = "amount-with-usd-component";

  static under(element: PageObjectElement): AmountWithUsdPo {
    return new AmountWithUsdPo(element.byTestId(AmountWithUsdPo.TID));
  }

  getAmountDisplayPo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root);
  }

  async getAmount(): Promise<string> {
    return this.getAmountDisplayPo().getAmount();
  }

  async getAmountInUsd(): Promise<string> {
    return this.getText("usd-value");
  }
}
