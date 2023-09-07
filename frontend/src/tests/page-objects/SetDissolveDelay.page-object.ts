import { SECONDS_IN_DAY } from "$lib/constants/constants";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { InputRangePo } from "$tests/page-objects/InputRange.page-object";
import { InputWithErrorPo } from "$tests/page-objects/InputWithError.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SetDissolveDelayPo extends BasePageObject {
  private static readonly TID = "set-dissolve-delay-component";

  static under(element: PageObjectElement): SetDissolveDelayPo {
    return new SetDissolveDelayPo(element.byTestId(SetDissolveDelayPo.TID));
  }

  getInputWithErrorPo(): InputWithErrorPo {
    return InputWithErrorPo.under({ element: this.root });
  }

  getUpdateButtonPo(): ButtonPo {
    return this.getButton("go-confirm-delay-button");
  }

  getMaxButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "max-button",
    });
  }

  getInputRangePo(): InputRangePo {
    return InputRangePo.under(this.root);
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

  async setDissolveDelayDays(days: "max" | number): Promise<void> {
    if (days === 0) {
      await this.clickSkip();
      return;
    }
    if (days === "max") {
      await this.clickMax();
    } else {
      await this.enterDays(days);
    }
    await this.clickUpdate();
  }

  async enterDays(days: number): Promise<void> {
    await this.getInputWithErrorPo().typeText(days.toString());
  }

  async getDays(): Promise<number> {
    return Number(await this.getInputWithErrorPo().getValue());
  }

  getErrorMessage(): Promise<string> {
    return this.getInputWithErrorPo().getErrorMessage();
  }

  async getSliderDays(): Promise<number> {
    // We round up to be consistent with `secondsToDays` in `date.utils.ts`.
    return Math.ceil(
      (await this.getInputRangePo().getValue()) / SECONDS_IN_DAY
    );
  }

  setSliderDays(days: number): Promise<void> {
    return this.getInputRangePo().setValue(days * SECONDS_IN_DAY);
  }
}
