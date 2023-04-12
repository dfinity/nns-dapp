import { BasePageObject } from "$tests/page-objects/base.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import { TransactionCardPo } from "$tests/page-objects/TransactionCard.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TransactionListPo extends BasePageObject {
  private static readonly TID = "transaction-list-component";

  static under(element: PageObjectElement): TransactionListPo {
    return new TransactionListPo(element.byTestId(TransactionListPo.TID));
  }

  getSkeletonCardPo(): SkeletonCardPo {
    return SkeletonCardPo.under(this.root);
  }

  getTransactionCardPos(): Promise<TransactionCardPo[]> {
    return TransactionCardPo.allUnder(this.root);
  }

  async waitForLoaded(): Promise<void> {
    await this.waitFor();
    await this.getSkeletonCardPo().waitForAbsent();
  }
}
