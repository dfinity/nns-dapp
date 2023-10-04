import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { InputWithErrorPo } from "$tests/page-objects/InputWithError.page-object";
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

  getTextInputPo(): InputWithErrorPo {
    return InputWithErrorPo.under({
      element: this.root,
    });
  }

  enterText(text: string): Promise<void> {
    return this.getTextInputPo().typeText(text);
  }

  getConfirmButtonPo(): ButtonPo {
    return this.getButton("confirm-text-input-screen-button");
  }

  clickSubmitButton(): Promise<void> {
    return this.getConfirmButtonPo().click();
  }

  getErrorMessage(): Promise<string | null> {
    return this.getTextInputPo().getErrorMessage();
  }
}
