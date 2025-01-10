import { InProgressPo } from "$tests/page-objects/InProgress.page-object";
import { TransactionModalBasePo } from "$tests/page-objects/TransactionModal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { TransactionFormItemNetworkPo } from "$tests/page-objects/TransactionFormItemNetwor.page-object";

export class CkBTCTransactionModalPo extends TransactionModalBasePo {
  private static readonly TID = "ckbtc-transaction-modal-component";

  static under(element: PageObjectElement): CkBTCTransactionModalPo {
    return new CkBTCTransactionModalPo(
      element.byTestId(CkBTCTransactionModalPo.TID)
    );
  }

  getTransactionFormItemNetworkPo(): TransactionFormItemNetworkPo {
    return TransactionFormItemNetworkPo.under(this.root);
  }

  getInProgressPo(): InProgressPo {
    return InProgressPo.under(this.root);
  }

  getEstimatedFee(): Promise<string> {
    return this.getText("bitcoin-estimated-fee");
  }

  getEstimatedFeeDisplay(): Promise<string> {
    return this.getText("bitcoin-estimated-fee-display");
  }

  getEstimatedKytFee(): Promise<string> {
    return this.getText("kyt-estimated-fee");
  }

  getEstimatedKytFeeDisplay(): Promise<string> {
    return this.getText("kyt-estimated-fee-display");
  }

  async selectNetwork(network: string): Promise<void> {
    return this.getTransactionFormItemNetworkPo().selectNetwork(network);
  }
}
