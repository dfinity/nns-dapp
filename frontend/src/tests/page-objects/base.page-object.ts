import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { InputPo } from "$tests/page-objects/Input.page-object";
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

  getInput(testId?: string): InputPo {
    return InputPo.under({ element: this.root, testId });
  }
}
