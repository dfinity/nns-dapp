import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { HashPo } from "./Hash.page-object";
import { UniversePageSummaryPo } from "./UniversePageSummary.page-object";

export class WalletPageHeaderPo extends BasePageObject {
  private static readonly TID = "wallet-page-header-component";

  static under(element: PageObjectElement): WalletPageHeaderPo {
    return new WalletPageHeaderPo(element.byTestId(WalletPageHeaderPo.TID));
  }

  getUniversePageSummaryPo(): UniversePageSummaryPo {
    return UniversePageSummaryPo.under(this.root);
  }

  getUniverse(): Promise<string> {
    return this.getUniversePageSummaryPo().getTitle();
  }

  getHashPo(): HashPo {
    return HashPo.under(this.root);
  }

  getWalletAddress(): Promise<string> {
    return this.getHashPo().getText();
  }
}
