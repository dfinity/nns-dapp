import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class DropdownPo extends BasePageObject {
  constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): DropdownPo {
    return new DropdownPo(element.querySelector("div.select"));
  }

  select(option: string): Promise<void> {
    return this.root.querySelector("select").selectOption(option);
  }
}
