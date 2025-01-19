import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronTestnetFunctionsCardPo extends BasePageObject {
  private static readonly TID = "nns-neuron-testnet-functions-card-component";

  static under(element: PageObjectElement): NnsNeuronTestnetFunctionsCardPo {
    return new NnsNeuronTestnetFunctionsCardPo(
      element.byTestId(NnsNeuronTestnetFunctionsCardPo.TID)
    );
  }

  clickAddMaturity(): Promise<void> {
    return this.click("add-maturity-button");
  }

  clickUpdateVotingPowerRefreshedTimestamp(): Promise<void> {
    return this.click("update-voting-power-refreshed-button");
  }
}
