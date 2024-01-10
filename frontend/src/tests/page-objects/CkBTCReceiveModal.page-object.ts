import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CkBTCReceiveModalPo extends BasePageObject {
  private static readonly TID = "ckbtc-receive-modal";

  static under(element: PageObjectElement): CkBTCReceiveModalPo {
    return new CkBTCReceiveModalPo(element.byTestId(CkBTCReceiveModalPo.TID));
  }

  selectBitcoin(): Promise<void> {
    return this.click("receive-bitcoin");
  }

  clickFinish(): Promise<void> {
    return this.click("reload-receive-account");
  }
}
