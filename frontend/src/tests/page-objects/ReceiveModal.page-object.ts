import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ReceiveModalPo extends BasePageObject {
  private static readonly TID = "receive-modal";

  static under(element: PageObjectElement): ReceiveModalPo {
    return new ReceiveModalPo(element.byTestId(ReceiveModalPo.TID));
  }

  clickFinish(): Promise<void> {
    return this.click("reload-receive-account");
  }
}
