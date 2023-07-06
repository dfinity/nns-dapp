import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SetDissolveDelayPo extends BasePageObject {
  private static readonly TID = "set-dissolve-delay-component";

  static under(element: PageObjectElement): SetDissolveDelayPo {
    return new SetDissolveDelayPo(element.byTestId(SetDissolveDelayPo.TID));
  }

  getUpdateButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "go-confirm-delay-button",
    });
  }

  getMaxButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "max-button",
    });
  }

  clickUpdate(): Promise<void> {
    return this.getUpdateButtonPo().click();
  }

  clickMax(): Promise<void> {
    return this.getMaxButtonPo().click();
  }

  clickSkip() {
    return this.click("cancel-neuron-delay");
  }

  async setDissolveDelayDays(days: "max" | 0): Promise<void> {
    if (days === 0) {
      await this.clickSkip();
      return;
    }
    if (days === "max") {
      await this.clickMax();
    }
    await this.clickUpdate();
  }
}
