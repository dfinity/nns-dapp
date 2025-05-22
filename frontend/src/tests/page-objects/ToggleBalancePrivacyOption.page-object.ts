import { TogglePo } from "$tests/page-objects/Toggle.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";

export class ToggleBalancePrivacyOptionPo extends BasePageObject {
  private static TID = "toggle-balance-privacy-option-component";

  static under(element: PageObjectElement): ToggleBalancePrivacyOptionPo {
    return new ToggleBalancePrivacyOptionPo(
      element.byTestId(ToggleBalancePrivacyOptionPo.TID)
    );
  }

  getToggle(): TogglePo {
    return TogglePo.under(this.root);
  }

  async isToggleEnabled(): Promise<boolean> {
    return this.getToggle().isEnabled();
  }
}
