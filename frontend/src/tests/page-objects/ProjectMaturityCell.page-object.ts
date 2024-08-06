import { MaturityWithTooltipPo } from "$tests/page-objects/MaturityWithTooltip.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectMaturityCellPo extends BasePageObject {
  private static readonly TID = "project-maturity-cell-component";

  static under(element: PageObjectElement): ProjectMaturityCellPo {
    return new ProjectMaturityCellPo(
      element.byTestId(ProjectMaturityCellPo.TID)
    );
  }

  getMaturityWithTooltipPo(): MaturityWithTooltipPo {
    return MaturityWithTooltipPo.under(this.root);
  }

  getTotalMaturity(): Promise<string> {
    return this.getMaturityWithTooltipPo().getTotalMaturity();
  }

  getAvailableMaturity(): Promise<string> {
    return this.getMaturityWithTooltipPo().getAvailableMaturity();
  }

  getStakedMaturity(): Promise<string> {
    return this.getMaturityWithTooltipPo().getStakedMaturity();
  }
}
