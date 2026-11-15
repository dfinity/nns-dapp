import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { CheckboxPo } from "$tests/page-objects/Checkbox.page-object";
import { InputWithErrorPo } from "$tests/page-objects/InputWithError.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ChangeHotkeyModalPo extends ModalPo {
  private static readonly TID = "change-hotkey-modal";

  static under(element: PageObjectElement): ChangeHotkeyModalPo {
    return new ChangeHotkeyModalPo(element.byTestId(ChangeHotkeyModalPo.TID));
  }

  getCurrentHotkey(): Promise<string> {
    return this.getText("current-hotkey");
  }

  getNewHotkeyInputPo(): InputWithErrorPo {
    return InputWithErrorPo.under({
      element: this.root,
      testId: "new-hotkey-input",
    });
  }

  typeNewHotkey(principal: string): Promise<void> {
    return this.getNewHotkeyInputPo().typeText(principal);
  }

  hasSameHotkeyError(): Promise<boolean> {
    return this.isPresent("same-hotkey-error");
  }

  hasWarning(): Promise<boolean> {
    return this.isPresent("callout-warning-component");
  }

  getNeuronCheckboxPos(): Promise<CheckboxPo[]> {
    return CheckboxPo.allUnder(this.root);
  }

  async getCannotChangeCount(): Promise<number> {
    return (await this.root.allByTestId("cannot-change")).length;
  }

  async getProjectSelectedCounts(): Promise<string[]> {
    const elements = await this.root.allByTestId("project-selected-count");
    return Promise.all(
      elements.map(async (element) => (await element.getText()).trim())
    );
  }

  getConfirmButtonPo(): ButtonPo {
    return this.getButton("confirm-button");
  }

  clickConfirm(): Promise<void> {
    return this.getConfirmButtonPo().click();
  }

  hasResultSuccess(): Promise<boolean> {
    return this.isPresent("result-success");
  }

  async getResultSuccessText(): Promise<string> {
    return (await this.getText("result-success")).trim();
  }

  hasResultPartial(): Promise<boolean> {
    return this.isPresent("result-partial");
  }

  async getFailedNeurons(): Promise<string[]> {
    const elements = await this.root.allByTestId("failed-neuron");
    return Promise.all(
      elements.map(async (element) =>
        (await element.getText()).replace(/\s+/g, " ").trim()
      )
    );
  }

  clickRetry(): Promise<void> {
    return this.click("retry-button");
  }

  isRetryDisabled(): Promise<boolean> {
    return this.getButton("retry-button").isDisabled();
  }

  clickClose(): Promise<void> {
    return this.click("close-button");
  }
}
