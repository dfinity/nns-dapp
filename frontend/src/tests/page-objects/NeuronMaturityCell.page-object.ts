import { MaturityWithTooltipPo } from "$tests/page-objects/MaturityWithTooltip.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronMaturityCellPo extends BasePageObject {
  private static readonly TID = "neuron-maturity-cell-component";

  static under(element: PageObjectElement): NeuronMaturityCellPo {
    return new NeuronMaturityCellPo(element.byTestId(NeuronMaturityCellPo.TID));
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
