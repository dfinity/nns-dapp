import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class BitcoinAddressPo extends BasePageObject {
  private static readonly TID = "bitcoin-address-component";

  static under(element: PageObjectElement): BitcoinAddressPo {
    return new BitcoinAddressPo(element.byTestId(BitcoinAddressPo.TID));
  }

  async hasSpinner(): Promise<boolean> {
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
}
