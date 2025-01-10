import { HashPo } from "$tests/page-objects/Hash.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class BuyICPModalPo extends ModalPo {
  private static readonly TID = "buy-icp-modal-component";

  static under(element: PageObjectElement): BuyICPModalPo {
    return new BuyICPModalPo(element.byTestId(BuyICPModalPo.TID));
  }

  getAccountIdentifier(): Promise<string> {
    return HashPo.under(this.root).getFullText();
  }

  getBanxaUrl(): Promise<string> {
    return this.root.byTestId("buy-icp-banxa-button").getAttribute("href");
  }
}
