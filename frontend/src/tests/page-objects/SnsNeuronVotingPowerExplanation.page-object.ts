import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronVotingPowerExplanationPo extends BasePageObject {
  static readonly TID = "sns-neuron-voting-power-explanation-component";

  static under(element: PageObjectElement): SnsNeuronVotingPowerExplanationPo {
    return new SnsNeuronVotingPowerExplanationPo(
      element.byTestId(SnsNeuronVotingPowerExplanationPo.TID)
    );
  }
}
