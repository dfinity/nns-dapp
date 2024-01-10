import { SimpleBasePageObject } from "$tests/page-objects/simple-base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish } from "@dfinity/utils";

export class RoleButtonPo extends SimpleBasePageObject {
  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId?: string;
  }): RoleButtonPo {
    if (isNullish(testId)) {
      return new RoleButtonPo(element.querySelector('[role="button"]'));
    }
    return new RoleButtonPo(
      element.querySelector(`[role="button"][data-tid=${testId}]`)
    );
  }

  click(): Promise<void> {
    return this.root.click();
  }
}
