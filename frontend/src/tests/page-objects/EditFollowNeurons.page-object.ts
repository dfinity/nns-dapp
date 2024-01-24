import { FollowTopicSectionPo } from "$tests/page-objects/FollowTopicSection.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import type { Topic } from "@dfinity/nns";

export class EditFollowNeuronsPo extends BasePageObject {
  private static readonly TID = "edit-followers-screen";

  static under(element: PageObjectElement): EditFollowNeuronsPo {
    return new EditFollowNeuronsPo(element.byTestId(EditFollowNeuronsPo.TID));
  }

  getFollowTopicSectionPo(topic: Topic): FollowTopicSectionPo {
    return FollowTopicSectionPo.under({
      element: this.root,
      topic,
    });
  }

  getBadgeNumber(topic: Topic): Promise<number> {
    return this.getFollowTopicSectionPo(topic).getBadgeNumber();
  }
}
