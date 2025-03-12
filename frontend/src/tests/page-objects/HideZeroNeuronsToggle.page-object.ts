import { TogglePo } from "$tests/page-objects/Toggle.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class HideZeroNeuronsTogglePo extends BasePageObject {
  private static readonly TID = "hide-zero-neurons-toggle-component";

  static under(element: PageObjectElement): HideZeroNeuronsTogglePo {
    return new HideZeroNeuronsTogglePo(
      element.byTestId(HideZeroNeuronsTogglePo.TID)
    );
  }

  getTogglePo(): TogglePo {
    return TogglePo.under(this.root);
  }
}
