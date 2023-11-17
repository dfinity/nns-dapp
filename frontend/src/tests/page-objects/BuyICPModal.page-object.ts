import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class BuyICPModalPo extends BasePageObject {
  private static readonly TID = "buy-icp-modal-component";

  static under(element: PageObjectElement): BuyICPModalPo {
    return new BuyICPModalPo(element.byTestId(BuyICPModalPo.TID));
  }
}
