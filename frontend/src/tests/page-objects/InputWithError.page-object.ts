import { TextInputPo } from "$tests/page-objects/TextInput.page-object";
import { SimpleBasePageObject } from "$tests/page-objects/simple-base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class InputWithErrorPo extends SimpleBasePageObject {
  static TID = "input-with-error-compoment";

  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId?: string;
  }): InputWithErrorPo {
    return new InputWithErrorPo(
      element.byTestId(testId ?? InputWithErrorPo.TID)
    );
  }

  getTextInputPo(): TextInputPo {
    return TextInputPo.under({
      element: this.root,
    });
  }

  typeText(text: string): Promise<void> {
    return this.getTextInputPo().typeText(text);
  }

  getValue(): Promise<string> {
    return this.getTextInputPo().getValue();
  }

  isDisabled(): Promise<boolean> {
    return this.getTextInputPo().isDisabled();
  }

  isRequired(): Promise<boolean> {
    return this.getTextInputPo().isRequired();
  }

  async getErrorMessage(): Promise<string | null> {
    return this.root.byTestId("input-error-message").isPresent()
      ? (await this.getText("input-error-message")).trim()
      : null;
  }
}
