import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TogglePo extends BasePageObject {
  constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): TransactionModalPo {
    return new TogglePo(element.querySelector("div.toggle"));
  }

  toggle(): Promise<void> {
    return this.root.querySelector("label").click();
  }
}
