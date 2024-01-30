import { DisburseMaturityButtonPo } from "$tests/page-objects/DisburseMaturityButton.page-object";
import { TooltipIconPo } from "$tests/page-objects/TooltipIcon.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsAvailableMaturityItemActionPo extends BasePageObject {
  private static readonly TID = "sns-available-maturity-item-action-component";

  static under(element: PageObjectElement): SnsAvailableMaturityItemActionPo {
    return new SnsAvailableMaturityItemActionPo(
      element.byTestId(SnsAvailableMaturityItemActionPo.TID)
    );
  }

  getTooltipIconPo(): TooltipIconPo {
    return TooltipIconPo.under(this.root);
  }

  getMaturity(): Promise<string> {
    return this.getText("available-maturity");
  }

  hasStakeButton(): Promise<boolean> {
    return this.getButton("stake-maturity-button").isPresent();
  }

  getDisburseMaturityButtonPo(): DisburseMaturityButtonPo {
    return DisburseMaturityButtonPo.under(this.root);
  }

  hasDisburseMaturityButton(): Promise<boolean> {
    return this.getDisburseMaturityButtonPo().isPresent();
  }
}
