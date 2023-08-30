import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TogglePo extends BasePageObject {
  static under(element: PageObjectElement): TogglePo {
    return new TogglePo(element.querySelector("div.toggle"));
  }

  toggle(): Promise<void> {
    return this.root.querySelector("label").click();
  }

  async isEnabled(): Promise<boolean> {
    return this.root.querySelector("input[type=checkbox]").isChecked();
  }

  async setEnabled(enabled: boolean = true): Promise<void> {
    if ((await this.isEnabled()) !== enabled) {
      await this.toggle();
    }
  }

  setDisabled(): Promise<void> {
    return this.setEnabled(false);
  }
}
