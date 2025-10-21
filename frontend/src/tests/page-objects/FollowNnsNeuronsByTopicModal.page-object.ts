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

  getUnderConstructionStep(): PageObjectElement {
    return this.root.byTestId(
      "follow-nns-neurons-by-topic-step-neuron-component"
    );
  }

  async isUnderConstructionStepPresent(): Promise<boolean> {
    return this.getUnderConstructionStep().isPresent();
  }

  async getSelectedTopics(): Promise<string[]> {
    const underConstructionStep = this.getUnderConstructionStep();
    const listItems = await underConstructionStep.querySelectorAll("li");
    return Promise.all(listItems.map((item) => item.getText()));
  }
}
