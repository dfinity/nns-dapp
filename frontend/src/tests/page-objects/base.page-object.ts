import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { SimpleBasePageObject } from "$tests/page-objects/simple-base.page-object";
import { TextInputPo } from "$tests/page-objects/TextInput.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

// We have 2 layers of base classes to avoid circular dependencies with classes
// this class depends on.
export class BasePageObject extends SimpleBasePageObject {
  constructor(root: PageObjectElement) {
    super(root);
  }

  getButton(testId?: string): ButtonPo {
    return ButtonPo.under({ element: this.root, testId });
  }

  getTextInput(testId?: string): TextInputPo {
    return TextInputPo.under({ element: this.root, testId });
  }
}
