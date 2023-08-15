import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class DropdownPo extends BasePageObject {
  private static readonly TID = "dropdown-component";

  static under(element: PageObjectElement): DropdownPo {
    return new DropdownPo(element.byTestId(DropdownPo.TID));
  }

  select(option: string): Promise<void> {
    return this.root.querySelector("select").selectOption(option);
  }

  async getOptions(): Promise<string[]> {
    const options = await this.root.querySelectorAll("option");
    return Promise.all(
      options.map(async (option) => (await option.getText()).trim())
    );
  }
}
