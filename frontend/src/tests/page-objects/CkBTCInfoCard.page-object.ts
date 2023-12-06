import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CkBTCInfoCardPo extends BasePageObject {
  private static readonly TID = "bitcoin-address-component";

  static under(element: PageObjectElement): CkBTCInfoCardPo {
    return new CkBTCInfoCardPo(element.byTestId(CkBTCInfoCardPo.TID));
  }

  getAddress(): Promise<string> {
    return this.getText("btc-address");
  }

  hasAddress(): Promise<boolean> {
    return this.isPresent("btc-address");
  }

  hasSkeletonText(): Promise<boolean> {
    return this.isPresent("skeleton-text");
  }

  hasSpinner(): Promise<boolean> {
    return this.isPresent("spinner");
  }

  getBlockExplorerLink(): PageObjectElement {
    return this.root.byTestId("block-explorer-link");
  }

  getUpdateBalanceButton(): ButtonPo {
    return this.getButton("manual-refresh-balance");
  }

  hasUpdateBalanceButton(): Promise<boolean> {
    return this.getUpdateBalanceButton().isPresent();
  }

  hasQrCode(): Promise<boolean> {
    return this.isPresent("qr-code");
  }
}
