import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { HashPo } from "./Hash.page-object";
import { UniversePageSummaryPo } from "./UniversePageSummary.page-object";

export class WalletPageHeaderPo extends BasePageObject {
  private static readonly TID = "wallet-page-header-component";

  static under(element: PageObjectElement): WalletPageHeaderPo {
    return new WalletPageHeaderPo(element.byTestId(WalletPageHeaderPo.TID));
  }

  getUniverse(): Promise<string> {
    return UniversePageSummaryPo.under(this.root).getTitle();
  }

  getWalletAddress(): Promise<string> {
    return HashPo.under(this.root).getText();
  }
}
