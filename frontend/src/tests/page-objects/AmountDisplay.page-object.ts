import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { assertNonNullish } from "$tests/utils/utils.test-utils";

export class AmountDisplayPo extends BasePageObject {
  private static readonly TID = "token-value-label";

  static under(element: PageObjectElement): AmountDisplayPo {
    return new AmountDisplayPo(element.byTestId(AmountDisplayPo.TID));
  }

  async getAmount(): Promise<string> {
    return assertNonNullish(
      await this.root.querySelector(`[data-tid="token-value"]`).getText()
    );
  }

  getCopyButtonPo(): ButtonPo {
    return this.getButton("copy-component");
  }
}
