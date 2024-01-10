import { TransactionModalBasePo } from "$tests/page-objects/TransactionModal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class IcrcTokenTransactionModalPo extends TransactionModalBasePo {
  private static readonly TID = "icrc-token-transaction-modal-component";

  static under(element: PageObjectElement): IcrcTokenTransactionModalPo {
    return new IcrcTokenTransactionModalPo(
      element.byTestId(IcrcTokenTransactionModalPo.TID)
    );
  }
}
