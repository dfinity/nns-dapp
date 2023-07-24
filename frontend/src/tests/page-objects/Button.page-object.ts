import { SimpleBasePageObject } from "$tests/page-objects/simple-base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish } from "@dfinity/utils";

export class ButtonPo extends SimpleBasePageObject {
  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId?: string;
  }): ButtonPo {
    if (isNullish(testId)) {
      return new ButtonPo(element.querySelector("button"));
    }
    return new ButtonPo(element.querySelector(`button[data-tid=${testId}]`));
  }

  click(): Promise<void> {
    return this.root.click();
  }

  async isDisabled(): Promise<boolean> {
    return (await this.root.getAttribute("disabled")) !== null;
  }

  getClasses(): Promise<string[]> {
    return this.root.getClasses();
  }
}
