import { BasePageObject } from "$tests/page-objects/base.page-object";
import { TooltipIconPo } from "$tests/page-objects/TooltipIcon.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronMaturityCellPo extends BasePageObject {
  private static readonly TID = "neuron-maturity-cell-component";

  static under(element: PageObjectElement): NeuronMaturityCellPo {
    return new NeuronMaturityCellPo(element.byTestId(NeuronMaturityCellPo.TID));
  }

  getTooltipIconPo(): TooltipIconPo {
    return TooltipIconPo.under(this.root);
  }

  getTotalMaturity(): Promise<string> {
    return this.getText("total-maturity");
  }

  async getAvailableMaturity(): Promise<string> {
    return (await this.getTooltipIconPo().getTooltipPo().getTooltipElement())
      .byTestId("available-maturity")
      .getText();
  }

  async getStakedMaturity(): Promise<string> {
    return (await this.getTooltipIconPo().getTooltipPo().getTooltipElement())
      .byTestId("staked-maturity")
      .getText();
  }
}
