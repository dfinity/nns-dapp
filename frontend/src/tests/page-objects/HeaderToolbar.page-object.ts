import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class HeaderToolbarPo extends BasePageObject {
  private static readonly TID = "header-toolbar-component";

  static under(element: PageObjectElement): HeaderToolbarPo {
    return new HeaderToolbarPo(element.byTestId(HeaderToolbarPo.TID));
  }

  getOpenAlfredButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "open-alfred",
    });
  }

  clickOpenAlfred(): Promise<void> {
    return this.getOpenAlfredButtonPo().click();
  }
}
