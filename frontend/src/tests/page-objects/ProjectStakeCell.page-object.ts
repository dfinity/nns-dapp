import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { AmountWithUsdPo } from "$tests/page-objects/AmountWithUsd.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectStakeCellPo extends BasePageObject {
  private static readonly TID = "project-stake-cell-component";

  static under(element: PageObjectElement): ProjectStakeCellPo {
    return new ProjectStakeCellPo(element.byTestId(ProjectStakeCellPo.TID));
  }

  getAmountWithUsdPo(): AmountWithUsdPo {
    return AmountWithUsdPo.under(this.root);
  }

  getAmountDisplayPo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root);
  }

  async getStake(): Promise<string> {
    return (await this.getAmountDisplayPo().getText()) ?? "";
  }

  async getStakeInUsd(): Promise<string> {
    return await this.getAmountWithUsdPo().getAmountInUsd();
  }

  async hasStakeInUsd(): Promise<boolean> {
    return await this.getAmountWithUsdPo().isPresent();
  }
}
