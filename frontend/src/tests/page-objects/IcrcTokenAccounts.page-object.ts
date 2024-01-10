import { BaseAccountsPo } from "$tests/page-objects/BaseAccounts.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { AccountCardPo } from "./AccountCard.page-object";
import { SkeletonCardPo } from "./SkeletonCard.page-object";

export class IcrcTokenAccountsPo extends BaseAccountsPo {
  private static readonly TID = "icrc-token-accounts-component";

  static under(element: PageObjectElement): IcrcTokenAccountsPo {
    return new IcrcTokenAccountsPo(element.byTestId(IcrcTokenAccountsPo.TID));
  }

  getSkeletonCardPo(): SkeletonCardPo {
    return SkeletonCardPo.under(this.root);
  }

  hasSkeleton(): Promise<boolean> {
    return this.getSkeletonCardPo().isPresent();
  }

  getAccountsCardPos(): Promise<AccountCardPo[]> {
    return AccountCardPo.allUnder(this.root);
  }
}
