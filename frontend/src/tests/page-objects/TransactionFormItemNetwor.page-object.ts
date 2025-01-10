import { DropdownPo } from "$tests/page-objects/Dropdown.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TransactionFormItemNetworkPo extends BasePageObject {
  private static readonly TID = "transaction-form-item-network-component";

  static under(element: PageObjectElement): TransactionFormItemNetworkPo {
    return new TransactionFormItemNetworkPo(
      element.byTestId(TransactionFormItemNetworkPo.TID)
    );
  }

  getDropdownPo() {
    return DropdownPo.under(this.root);
  }

  async selectNetwork(network: string) {
    return this.getDropdownPo().select(network);
  }
}
