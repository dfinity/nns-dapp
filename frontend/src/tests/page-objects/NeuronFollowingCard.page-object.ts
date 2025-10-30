import { FollowNeuronsButtonPo } from "$tests/page-objects/FollowNeuronsButton.page-object";
import { FolloweePo } from "$tests/page-objects/Followee.page-object";
import { NnsNeuronModalsPo } from "$tests/page-objects/NnsNeuronModals.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronFollowingCardPo extends BasePageObject {
  static readonly TID = "neuron-following-card-component";
  private container: PageObjectElement;

  constructor(root: PageObjectElement, container?: PageObjectElement) {
    super(root);
    this.container = container || root;
  }

  static under(element: PageObjectElement): NeuronFollowingCardPo {
    const cardElement = element.byTestId(NeuronFollowingCardPo.TID);
    return new NeuronFollowingCardPo(cardElement, element);
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

  getTopicDefinitionsButton(): PageObjectElement {
    return this.root.byTestId("topic-definitions-button");
  }

  getNnsNeuronModalsPo(): NnsNeuronModalsPo {
    // Modals are rendered at the container level, so we use the stored container reference
    return NnsNeuronModalsPo.under(this.container);
  }
}
