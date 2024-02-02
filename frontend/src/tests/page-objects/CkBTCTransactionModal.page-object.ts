import { TransactionModalBasePo } from "$tests/page-objects/TransactionModal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { TransactionFormItemNetworkPo } from "./TransactionFormItemNetwor.page-object";

export class CkBTCTransactionModalPo extends TransactionModalBasePo {
  private static readonly TID = "ckbtc-transaction-modal-component";

  static under(element: PageObjectElement): CkBTCTransactionModalPo {
    return new CkBTCTransactionModalPo(
      element.byTestId(CkBTCTransactionModalPo.TID)
    );
  }

  getTransactionFormItemNetworkPo() {
    return TransactionFormItemNetworkPo.under(this.root);
  }

  async selectNetwork(network: string) {
    return this.getTransactionFormItemNetworkPo().selectNetwork(network);
  }
}
