import { FollowSnsNeuronsByTopicStepNeuronPo } from "$tests/page-objects/FollowSnsNeuronsByTopicStepNeuron.page-object";
import { FollowSnsNeuronsByTopicStepTopicsPo } from "$tests/page-objects/FollowSnsNeuronsByTopicStepTopics.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowSnsNeuronsByTopicModalPo extends ModalPo {
  private static readonly TID = "follow-sns-neurons-by-topic-modal";

  static under(
    element: PageObjectElement
  ): FollowSnsNeuronsByTopicModalPo | null {
    return new FollowSnsNeuronsByTopicModalPo(
      element.byTestId(FollowSnsNeuronsByTopicModalPo.TID)
    );
  }

  clickCloseButton(): Promise<void> {
    return this.getFollowSnsNeuronsByTopicStepTopicsPo().clickCancelButton();
  }

  getFollowSnsNeuronsByTopicStepTopicsPo(): FollowSnsNeuronsByTopicStepTopicsPo {
    return FollowSnsNeuronsByTopicStepTopicsPo.under(this.root);
  }

  getFollowSnsNeuronsByTopicStepNeuronPo(): FollowSnsNeuronsByTopicStepNeuronPo {
    return FollowSnsNeuronsByTopicStepNeuronPo.under(this.root);
  }
}
