import { BaseAccountsPo } from "$tests/page-objects/BaseAccounts.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CkBTCAccountsPo extends BaseAccountsPo {
  private static readonly TID = "ckbtc-accounts-body";

  static under(element: PageObjectElement): CkBTCAccountsPo {
    return new CkBTCAccountsPo(element.byTestId(CkBTCAccountsPo.TID));
  }

  getSkeletonCardPo(): SkeletonCardPo {
    return SkeletonCardPo.under(this.root);
  }

  waitForWithdrawalAccountDone(): Promise<void> {
    return this.waitFor("all-btc-transfers-complete");
  }

  async waitForContentLoaded(): Promise<void> {
    await this.waitFor();
    await this.getSkeletonCardPo().waitForAbsent();
  }
}
