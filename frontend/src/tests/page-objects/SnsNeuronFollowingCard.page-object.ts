import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { SnsFolloweePo } from "$tests/page-objects/SnsFollowee.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronFollowingCardPo extends BasePageObject {
  static readonly TID = "sns-neuron-following-card-component";

  static under(element: PageObjectElement): SnsNeuronFollowingCardPo {
    return new SnsNeuronFollowingCardPo(
      element.byTestId(SnsNeuronFollowingCardPo.TID)
    );
  }

  getSnsFolloweePos(): Promise<SnsFolloweePo[]> {
    return SnsFolloweePo.allUnder(this.root);
  }

  hasSkeletonFollowees(): Promise<boolean> {
    return this.isPresent("skeleton-followees");
  }

  getFollowSnsNeuronsButtonPo(): ButtonPo {
    return this.getButton("sns-follow-neurons-button");
  }
}
