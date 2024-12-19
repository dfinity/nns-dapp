import { BasePageObject } from "$tests/page-objects/base.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import { TransactionCardPo } from "$tests/page-objects/TransactionCard.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class UiTransactionsListPo extends BasePageObject {
  private static readonly TID = "transactions-list";

  static under(element: PageObjectElement): UiTransactionsListPo {
    return new UiTransactionsListPo(element.byTestId(UiTransactionsListPo.TID));
  }

  getSkeletonCardPo(): SkeletonCardPo {
    return SkeletonCardPo.under(this.root);
  }

  getTransactionCardPos(): Promise<TransactionCardPo[]> {
    return TransactionCardPo.allUnder(this.root);
  }

  hasSkeleton(): Promise<boolean> {
    return this.getSkeletonCardPo().isPresent();
  }

  hasNoTransactions(): Promise<boolean> {
    return this.isPresent("no-transactions-component");
  }

  hasSpinner() {
    return this.isPresent("spinner");
  }

  async waitForLoaded(): Promise<void> {
    await this.waitFor();
    await this.getSkeletonCardPo().waitForAbsent();
  }
}
