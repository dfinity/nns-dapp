import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { AmountWithUsdPo } from "$tests/page-objects/AmountWithUsd.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronStakeCellPo extends BasePageObject {
  private static readonly TID = "neuron-stake-cell-component";

  static under(element: PageObjectElement): NeuronStakeCellPo {
    return new NeuronStakeCellPo(element.byTestId(NeuronStakeCellPo.TID));
  }

  getAmountWithUsdPo(): AmountWithUsdPo {
    return AmountWithUsdPo.under(this.root);
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

  async getStakeInUsd(): Promise<string> {
    return await this.getAmountWithUsdPo().getAmountInUsd();
  }

  async hasStakeInUsd(): Promise<boolean> {
    return await this.getAmountWithUsdPo().isPresent();
  }
}
