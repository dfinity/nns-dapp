import { TogglePo } from "$tests/page-objects/Toggle.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class HideZeroBalancesTogglePo extends BasePageObject {
  private static readonly TID = "hide-zero-balances-toggle-component";

  static under(element: PageObjectElement): HideZeroBalancesTogglePo {
    return new HideZeroBalancesTogglePo(
      element.byTestId(HideZeroBalancesTogglePo.TID)
    );
  }

  getTogglePo(): TogglePo {
    return TogglePo.under(this.root);
  }
}
