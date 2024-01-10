import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { RoleButtonPo } from "$tests/page-objects/RoleButton.page-object";
import { TextInputPo } from "$tests/page-objects/TextInput.page-object";
import { SimpleBasePageObject } from "$tests/page-objects/simple-base.page-object";

// We have 2 layers of base classes to avoid circular dependencies with classes
// this class depends on.
export class BasePageObject extends SimpleBasePageObject {
  getButton(testId?: string): ButtonPo {
    return ButtonPo.under({ element: this.root, testId });
  }

  getRoleButton(testId?: string): RoleButtonPo {
    return RoleButtonPo.under({ element: this.root, testId });
  }

  getTextInput(testId?: string): TextInputPo {
    return TextInputPo.under({ element: this.root, testId });
  }
}
