import { SelectUniverseCardPo } from "$tests/page-objects/SelectUniverseCard.page-object";
import { SelectUniverseListPo } from "$tests/page-objects/SelectUniverseList.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SelectUniverseDropdownPo extends BasePageObject {
  private static readonly TID = "select-universe-dropdown-component";

  static under(element: PageObjectElement): SelectUniverseDropdownPo {
    return new SelectUniverseDropdownPo(
      element.byTestId(SelectUniverseDropdownPo.TID)
    );
  }

  // There are multiple SelectUniverseCard components in the dropdown, but the
  // first one should always be the button to open the dropdown.
  getSelectUniverseCardPo(): SelectUniverseCardPo {
    return SelectUniverseCardPo.under(this.root);
  }

  getSelectUniverseListPo(): SelectUniverseListPo {
    return SelectUniverseListPo.under(this.root);
  }
}
