import { FollowTopicSectionPo } from "$tests/page-objects/FollowTopicSection.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowSnsNeuronsModalPo extends ModalPo {
  private static readonly TID = "follow-sns-neurons-modal";

  static under(element: PageObjectElement): FollowSnsNeuronsModalPo | null {
    return new FollowSnsNeuronsModalPo(
      element.byTestId(FollowSnsNeuronsModalPo.TID)
    );
  }

  getFollowTopicSectionPo(topic: bigint): FollowTopicSectionPo {
    return FollowTopicSectionPo.under({
      element: this.root,
      topic: Number(topic),
    });
  }

  hasSpinner(): Promise<boolean> {
    return this.isPresent("spinner");
  }
}
