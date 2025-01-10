import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { FolloweePo } from "$tests/page-objects/Followee.page-object";
import { FollowNeuronsButtonPo } from "$tests/page-objects/FollowNeuronsButton.page-object";

export class NeuronFollowingCardPo extends BasePageObject {
  static readonly TID = "neuron-following-card-component";

  static under(element: PageObjectElement): NeuronFollowingCardPo {
    return new NeuronFollowingCardPo(
      element.byTestId(NeuronFollowingCardPo.TID)
    );
  }

  getFollowNeuronsButtonPo(): FollowNeuronsButtonPo {
    return FollowNeuronsButtonPo.under({
      element: this.root,
    });
  }

  getFolloweesList(): PageObjectElement {
    return this.root.byTestId("followees-list");
  }

  async getFolloweePos(): Promise<FolloweePo[]> {
    return FolloweePo.allUnder(this.root);
  }
}
