import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { HashPo } from "./Hash.page-object";

export class BuyICPModalPo extends BasePageObject {
  private static readonly TID = "buy-icp-modal-component";

  static under(element: PageObjectElement): BuyICPModalPo {
    return new BuyICPModalPo(element.byTestId(BuyICPModalPo.TID));
  }

  getAccountIdentifier(): Promise<string> {
    return HashPo.under(this.root).getText();
  }

  clickBanxa(): Promise<void> {
    return this.click("buy-icp-banxa-button");
  }
}
