import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AmountInputFiatValuePo extends BasePageObject {
  private static readonly TID = "amount-input-fiat-value-component";

  static under(element: PageObjectElement): AmountInputFiatValuePo {
    return new AmountInputFiatValuePo(
      element.byTestId(AmountInputFiatValuePo.TID)
    );
  }

  getFiatValue(): Promise<string> {
    return this.getText("fiat-value");
  }

  getBalancePo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root);
  }

  hasBalance(): Promise<boolean> {
    return this.getBalancePo().isPresent();
  }

  async hasError(): Promise<boolean> {
    const classes = await this.root.getClasses();
    return classes.includes("has-error");
  }
}
