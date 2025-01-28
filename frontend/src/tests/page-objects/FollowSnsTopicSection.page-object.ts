import { FollowTopicSectionPo } from "$tests/page-objects/FollowTopicSection.page-object";
import { HashPo } from "$tests/page-objects/Hash.page-object";
import { NewSnsFolloweeModalPo } from "$tests/page-objects/NewSnsFolloweeModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowSnsTopicSectionPo extends BasePageObject {
  private static readonly TID = "follow-sns-topic-section-component";

  static under(element: PageObjectElement): FollowSnsTopicSectionPo {
    return new FollowSnsTopicSectionPo(
      element.byTestId(FollowSnsTopicSectionPo.TID)
    );
  }

  async getFollowTopicSectionPo(): Promise<FollowTopicSectionPo> {
    const article = this.root.querySelector("article");
    const testId = await article.getAttribute("data-tid");
    const topic = Number(testId.match(/follow-topic-(\d+)-section/)[1]);
    return FollowTopicSectionPo.under({
      element: this.root,
      topic,
    });
  }

  getHashPos(): Promise<HashPo[]> {
    return HashPo.allUnder(this.root);
  }

  getNewSnsFolloweeModalPo(): NewSnsFolloweeModalPo {
    return NewSnsFolloweeModalPo.under(this.root);
  }

  async removeFollowee(followeeId: string): Promise<void> {
    const listItems = await this.root.allByTestId("current-followee-item");
    for (const listItem of listItems) {
      const hashPo = HashPo.under(listItem);
      if ((await hashPo.getFullText()) === followeeId) {
        listItem.querySelector("button").click();
        return;
      }
    }
    throw new Error(`Followee with id ${followeeId} not found`);
  }
}
