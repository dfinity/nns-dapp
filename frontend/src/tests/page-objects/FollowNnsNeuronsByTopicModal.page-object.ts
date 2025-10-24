import { FollowNnsNeuronsByTopicStepNeuronPo } from "$tests/page-objects/FollowNnsNeuronsByTopicStepNeuron.page-object";
import { FollowNnsNeuronsByTopicStepTopicsPo } from "$tests/page-objects/FollowNnsNeuronsByTopicStepTopics.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowNnsNeuronsByTopicModalPo extends BasePageObject {
  private static readonly TID = "follow-nns-neurons-by-topic-modal";

  static under(element: PageObjectElement): FollowNnsNeuronsByTopicModalPo {
    return new FollowNnsNeuronsByTopicModalPo(
      element.byTestId(FollowNnsNeuronsByTopicModalPo.TID)
    );
  }

  getFollowNnsNeuronsByTopicStepTopicsPo(): FollowNnsNeuronsByTopicStepTopicsPo {
    return FollowNnsNeuronsByTopicStepTopicsPo.under(this.root);
  }

  getFollowNnsNeuronsByTopicStepNeuronPo(): FollowNnsNeuronsByTopicStepNeuronPo {
    return FollowNnsNeuronsByTopicStepNeuronPo.under(this.root);
  }
}
