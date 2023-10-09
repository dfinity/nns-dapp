import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { HashPo } from "./Hash.page-object";

export class WalletPageHeadingPo extends BasePageObject {
  private static readonly TID = "wallet-page-heading-component";

  static under(element: PageObjectElement): WalletPageHeadingPo {
    return new WalletPageHeadingPo(element.byTestId(WalletPageHeadingPo.TID));
  }

  getTitle(): Promise<string> {
    return this.getText("wallet-page-heading-title");
  }

  hasSkeleton(): Promise<boolean> {
    return this.isPresent("skeleton");
  }

  getSubtitle(): Promise<string> {
    return this.getText("wallet-page-heading-subtitle");
  }

  getPrincipal(): Promise<string> {
    return HashPo.under(
      this.root.byTestId("wallet-page-heading-principal")
    ).getText();
  }
}
