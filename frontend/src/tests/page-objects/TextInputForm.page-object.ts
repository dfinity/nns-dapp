import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { TextInputPo } from "$tests/page-objects/TextInput.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

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

  getTextInputPo(): TextInputPo {
    return TextInputPo.under({
      element: this.root,
    });
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

  clickSubmitButton(): Promise<void> {
    return this.getConfirmButtonPo().click();
  }
}
