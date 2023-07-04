import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SetDissolveDelayPo extends BasePageObject {
  private static readonly TID = "set-dissolve-delay-component";

  static under(element: PageObjectElement): SetDissolveDelayPo {
    return new SetDissolveDelayPo(element.byTestId(SetDissolveDelayPo.TID));
  }

  clickUpdate(): Promise<void> {
    return this.click("go-confirm-delay-button");
  }

  clickMax(): Promise<void> {
    return this.click("max-button");
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
