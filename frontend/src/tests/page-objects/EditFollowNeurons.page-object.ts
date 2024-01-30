import { FollowTopicSectionPo } from "$tests/page-objects/FollowTopicSection.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class EditFollowNeuronsPo extends BasePageObject {
  private static readonly TID = "edit-followers-screen";

  static under(element: PageObjectElement): EditFollowNeuronsPo {
    return new EditFollowNeuronsPo(element.byTestId(EditFollowNeuronsPo.TID));
  }

  getFollowTopicSectionPo(topic: number): FollowTopicSectionPo {
    return FollowTopicSectionPo.under({
      element: this.root,
      topic,
    });
  }

  getBadgeNumber(topic: number): Promise<number> {
    return this.getFollowTopicSectionPo(topic).getBadgeNumber();
  }
}
