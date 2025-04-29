import { ActionableProposalsSegmentPo } from "$tests/page-objects/ActionableProposalsSegment.page-object";
import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { FilterModalPo } from "$tests/page-objects/FilterModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsProposalFiltersPo extends BasePageObject {
  private static readonly TID = "sns-proposals-filters-component";

  static under(element: PageObjectElement): SnsProposalFiltersPo {
    return new SnsProposalFiltersPo(element.byTestId(SnsProposalFiltersPo.TID));
  }

  getFilterByTypesButtonPo(): ButtonPo {
    return this.getButton("filters-by-types");
  }

  getFilterByRewardsButtonPo(): ButtonPo {
    return this.getButton("filters-by-rewards");
  }

  getFilterByStatusButtonPo(): ButtonPo {
    return this.getButton("filters-by-status");
  }

  getFilterByTopicsButtonPo(): ButtonPo {
    return this.getButton("filters-by-topics");
  }

  clickFiltersByTypesButton(): Promise<void> {
    return this.getFilterByTypesButtonPo().click();
  }

  clickFiltersByRewardsButton(): Promise<void> {
    return this.getFilterByRewardsButtonPo().click();
  }

  clickFiltersByStatusButton(): Promise<void> {
    return this.getFilterByStatusButtonPo().click();
  }

  clickFiltersByTopicButton(): Promise<void> {
    return this.getFilterByTopicsButtonPo().click();
  }

  getFilterModalPo(): FilterModalPo {
    return FilterModalPo.under(this.root);
  }

  getActionableProposalsSegmentPo(): ActionableProposalsSegmentPo {
    return ActionableProposalsSegmentPo.under(this.root);
  }
}
