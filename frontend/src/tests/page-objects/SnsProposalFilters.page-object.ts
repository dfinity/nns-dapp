import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { FilterModalPo } from "$tests/page-objects/FilterModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsProposalFiltersPo extends BasePageObject {
  private static readonly TID = "sns-proposals-filters-component";

  static under(element: PageObjectElement): SnsProposalFiltersPo {
    return new SnsProposalFiltersPo(element.byTestId(SnsProposalFiltersPo.TID));
  }

  getFilterByTypesButton(): ButtonPo {
    return this.getButton("filters-by-types");
  }

  getFilterByRewardsButton(): ButtonPo {
    return this.getButton("filters-by-rewards");
  }

  getFilterByStatusButton(): ButtonPo {
    return this.getButton("filters-by-status");
  }

  clickFiltersByTypesButton(): Promise<void> {
    return this.getFilterByTypesButton().click();
  }

  clickFiltersByRewardsButton(): Promise<void> {
    return this.getFilterByRewardsButton().click();
  }

  clickFiltersByStatusButton(): Promise<void> {
    return this.getFilterByStatusButton().click();
  }

  getFilterModalPo(): FilterModalPo {
    return FilterModalPo.under(this.root);
  }
}
