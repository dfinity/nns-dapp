import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronStakeCellPo extends BasePageObject {
  private static readonly TID = "neuron-stake-cell-component";

  static under(element: PageObjectElement): NeuronStakeCellPo {
    return new NeuronStakeCellPo(element.byTestId(NeuronStakeCellPo.TID));
  }

  getAmountDisplayPo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root);
  }

  getStake(): Promise<string> {
    return this.getAmountDisplayPo().getText();
  }

  getStakeBalance(): Promise<string> {
    return this.getAmountDisplayPo().getAmount();
  }
}
