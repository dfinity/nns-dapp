import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { TextInputWithErrorPo } from "./TextInputWithError.page-object copy";

export class TextInputFormPo extends BasePageObject {
  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId: string;
  }): TextInputFormPo {
    return new TextInputFormPo(element.byTestId(testId));
  }

  getTextInputPo(): TextInputWithErrorPo {
    return TextInputWithErrorPo.under({
      element: this.root,
    });
  }

  hasTextInput(): Promise<boolean> {
    return this.getTextInputPo().isPresent();
  }

  enterText(text: string): Promise<void> {
    return this.getTextInputPo().typeText(text);
  }

  getConfirmButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "confirm-text-input-screen-button",
    });
  }

  hasConfirmButton(): Promise<boolean> {
    return this.getConfirmButtonPo().isPresent();
  }

  clickSubmitButton(): Promise<void> {
    return this.getConfirmButtonPo().click();
  }

  getErrorMessage(): Promise<string | null> {
    return this.getTextInputPo().getErrorMessage();
  }
}
