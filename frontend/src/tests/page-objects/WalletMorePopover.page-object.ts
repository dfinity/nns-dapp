import { LinkToDashboardCanisterPo } from "$tests/page-objects/LinkToDashboardCanister.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import type { ButtonPo } from "./Button.page-object";

export class WalletMorePopoverPo extends BasePageObject {
  private static readonly TID = "wallet-more-popover-component";

  static under(element: PageObjectElement): WalletMorePopoverPo {
    return new WalletMorePopoverPo(element.byTestId(WalletMorePopoverPo.TID));
  }

  getLinkToLedgerCanisterPo(): LinkToDashboardCanisterPo {
    return LinkToDashboardCanisterPo.under({
      element: this.root,
      testId: "link-to-ledger-canister",
    });
  }

  getLinkToIndexCanisterPo(): LinkToDashboardCanisterPo {
    return LinkToDashboardCanisterPo.under({
      element: this.root,
      testId: "link-to-index-canister",
    });
  }

  getRemoveButtonPo(): ButtonPo {
    return this.getButton("remove-button");
  }
}
