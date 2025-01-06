import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { FolloweePo } from "./Followee.page-object";
import { FollowNeuronsButtonPo } from "./FollowNeuronsButton.page-object";
import { KeyValuePairInfoPo } from "./KeyValuePairInfo.page-object";

export class NeuronFollowingCardPo extends BasePageObject {
  static readonly TID = "neuron-following-card-component";

  static under(element: PageObjectElement): NeuronFollowingCardPo {
    return new NeuronFollowingCardPo(
      element.byTestId(NeuronFollowingCardPo.TID)
    );
  }

  getKeyValuePairPo(): KeyValuePairInfoPo {
    return KeyValuePairInfoPo.under({
      element: this.root,
      testId: "neuron-following",
    });
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
