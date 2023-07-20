import { SimpleBasePageObject } from "$tests/page-objects/simple-base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CheckboxPo extends SimpleBasePageObject {
  private static readonly TID = "checkbox-component";

  static under({ element }: { element: PageObjectElement }): CheckboxPo {
    return new CheckboxPo(element.byTestId(CheckboxPo.TID));
  }

  static async allUnder(element: PageObjectElement): Promise<CheckboxPo[]> {
    return Array.from(await element.allByTestId(CheckboxPo.TID)).map(
      (el) => new CheckboxPo(el)
    );
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
