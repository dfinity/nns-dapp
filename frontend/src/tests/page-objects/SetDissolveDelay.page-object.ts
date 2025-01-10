import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { InputWithErrorPo } from "$tests/page-objects/InputWithError.page-object";
import { RangeDissolveDelayPo } from "$tests/page-objects/RangeDissolveDelay.page-object";
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

  getMinButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "min-button",
    });
  }

  getMaxButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "max-button",
    });
  }

  getRangeDissolveDelayPo(): RangeDissolveDelayPo {
    return RangeDissolveDelayPo.under(this.root);
  }

  getNeuronStake(): Promise<string> {
    return this.getText("neuron-stake");
  }

  clickUpdate(): Promise<void> {
    return this.getUpdateButtonPo().click();
  }

  clickMax(): Promise<void> {
    return this.getMaxButtonPo().click();
  }

  clickMin(): Promise<void> {
    return this.getMinButtonPo().click();
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

  hasErrorOutline(): Promise<boolean> {
    return this.getInputWithErrorPo().hasErrorOutline();
  }

  async getProgressBarSeconds(): Promise<number> {
    return this.getRangeDissolveDelayPo().getProgressBarSeconds();
  }

  getDescription(): Promise<string> {
    return this.getText("description");
  }

  async getMinDissolveDelayDescription(): Promise<string> {
    return this.getText("min-dissolve-delay-description");
  }
}
