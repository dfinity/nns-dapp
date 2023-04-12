import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TogglePo extends BasePageObject {
  static under(element: PageObjectElement): TogglePo {
    return new TogglePo(element.querySelector("div.toggle"));
  }

  toggle(): Promise<void> {
    return this.root.querySelector("label").click();
  }
}
