import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class UniverseAccountsBalancePo extends BasePageObject {
  private static readonly TID = "universe-accounts-balance-component";

  static under(element: PageObjectElement): UniverseAccountsBalancePo {
    return new UniverseAccountsBalancePo(
      element.byTestId(UniverseAccountsBalancePo.TID)
    );
  }

  getAmountDisplayPo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root);
  }

  isLoaded(): Promise<boolean> {
    return this.getAmountDisplayPo().isPresent();
  }

  isLoading(): Promise<boolean> {
    return this.isPresent("skeleton-text");
  }

  getBalance(): Promise<string> {
    return this.getAmountDisplayPo().getAmount();
  }
}
