import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ToastPo extends BasePageObject {
  private static readonly TID = "toast-component";

  static under(element: PageObjectElement): ToastPo {
    return new ToastPo(element.byTestId(ToastPo.TID));
  }

  static async allUnder(element: PageObjectElement): Promise<ToastPo[]> {
    return Array.from(await element.allByTestId(ToastPo.TID)).map(
      (el) => new ToastPo(el)
    );
  }

  async getMessage(): Promise<string> {
    return (await this.getText("toast-message")).trim();
  }

  close(): Promise<void> {
    return this.click("close-button");
  }
}
