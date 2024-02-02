import type { PageObjectElement } from "$tests/types/page-object.types";
import { DropdownPo } from "./Dropdown.page-object";
import { BasePageObject } from "./base.page-object";

export class TransactionFormItemNetworkPo extends BasePageObject {
  private static readonly TID = "transaction-form-item-network-component";

  static under(element: PageObjectElement): TransactionFormItemNetworkPo {
    return new TransactionFormItemNetworkPo(
      element.byTestId(TransactionFormItemNetworkPo.TID)
    );
  }

  getDropdown() {
    return DropdownPo.under(this.root);
  }

  async selectNetwork(network: string) {
    return this.getDropdown().select(network);
  }
}
