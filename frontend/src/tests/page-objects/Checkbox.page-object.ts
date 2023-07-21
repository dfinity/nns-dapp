import { SimpleBasePageObject } from "$tests/page-objects/simple-base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish } from "@dfinity/utils";

export class CheckboxPo extends SimpleBasePageObject {
  private static readonly COMPONENT_SELECTOR = `.checkbox[role="button"]`;

  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId?: string;
  }): CheckboxPo {
    if (isNullish(testId)) {
      return new CheckboxPo(
        element.querySelector(CheckboxPo.COMPONENT_SELECTOR)
      );
    }
    return new CheckboxPo(element.byTestId(testId));
  }

  static async allUnder(element: PageObjectElement): Promise<CheckboxPo[]> {
    return Array.from(
      await element.querySelectorAll(CheckboxPo.COMPONENT_SELECTOR)
    ).map((el) => new CheckboxPo(el));
  }

  toggle(): Promise<void> {
    return this.root.click();
  }

  getCheckboxInput(): PageObjectElement {
    return this.root.byTestId("checkbox");
  }

  async isDisabled(): Promise<boolean> {
    return (await this.getCheckboxInput().getAttribute("disabled")) !== null;
  }

  async isChecked(): Promise<boolean> {
    return await this.getCheckboxInput().isChecked();
  }
}
