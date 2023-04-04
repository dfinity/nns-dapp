import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AmountInputPo extends BasePageObject {
  private static readonly TID = "amount-input-component";

  static under(element: PageObjectElement): AmountInputPo {
    return new AmountInputPo(element.byTestId(AmountInputPo.TID));
  }

  enterAmount(amount: number): Promise<void> {
    return this.getTextInput().typeText(amount.toString());
  }
}
