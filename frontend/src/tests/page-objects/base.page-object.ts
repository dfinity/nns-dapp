import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { TextInputPo } from "$tests/page-objects/TextInput.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class BasePageObject {
  readonly root: PageObjectElement;

  constructor(root: PageObjectElement) {
    this.root = root;
  }

  isPresent(): Promise<boolean> {
    return this.root.isPresent();
  }

  getButton(testId?: string): ButtonPo {
    return ButtonPo.under({ element: this.root, testId });
  }

  getTextInput(testId?: string): TextInputPo {
    return TextInputPo.under({ element: this.root, testId });
  }
}
