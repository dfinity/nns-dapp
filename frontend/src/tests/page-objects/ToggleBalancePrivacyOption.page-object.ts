import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { TogglePo } from "$tests/page-objects/Toggle.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ToggleBalancePrivacyOptionPageObject extends ButtonPo {
  private static TID = "toggle-balance-privacy-option-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): ToggleBalancePrivacyOptionPageObject {
    return new ToggleBalancePrivacyOptionPageObject(
      element.byTestId(ToggleBalancePrivacyOptionPageObject.TID)
    );
  }

  getToggle(): TogglePo {
    return TogglePo.under(this.root);
  }

  async isToggleEnabled(): Promise<boolean> {
    return this.getToggle().isEnabled();
  }
}
