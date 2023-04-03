import { TransactionModalPo } from "$tests/page-objects/TransactionModal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class IcpTransactionModalPo extends TransactionModalPo {
  private static readonly TID = "icp-transaction-modal-component";

  constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): IcpTransactionModalPo {
    return new IcpTransactionModalPo(
      element.byTestId(IcpTransactionModalPo.TID)
    );
  }
}
