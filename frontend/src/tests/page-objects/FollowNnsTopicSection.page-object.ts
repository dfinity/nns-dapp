import { FollowTopicSectionPo } from "$tests/page-objects/FollowTopicSection.page-object";
import { NewFolloweeModalPo } from "$tests/page-objects/NewFolloweeModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowNnsTopicSectionPo extends BasePageObject {
  private static readonly TID = "follow-nns-topic-section-component";

  static under(element: PageObjectElement): FollowNnsTopicSectionPo {
    return new FollowNnsTopicSectionPo(
      element.byTestId(FollowNnsTopicSectionPo.TID)
    );
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<FollowNnsTopicSectionPo[]> {
    return Array.from(
      (await element.allByTestId(FollowNnsTopicSectionPo.TID)).map(
        (el) => new FollowNnsTopicSectionPo(el)
      )
    );
  }

  async getFollowTopicSectionPo(): Promise<FollowTopicSectionPo> {
    const dataTid = await this.root
      .querySelector("article[data-tid^='follow-topic-']")
      .getAttribute("data-tid");
    const [_, topic] = dataTid.match(/follow-topic-(\d+)-section/);
    return FollowTopicSectionPo.under({
      element: this.root,
      topic: Number(topic),
    });
  }

  async hasSeparator(): Promise<boolean> {
    return this.root.byTestId("separator").isPresent();
  }

  getNewFolloweeModalPo(): NewFolloweeModalPo {
    return NewFolloweeModalPo.under(this.root);
  }

  async getFollowees(): Promise<string[]> {
    return Promise.all(
      (await this.root.allByTestId("current-followee-item")).map(async (el) =>
        (await el.getText()).trim()
      )
    );
  }

  async addFollowee(followee: string): Promise<void> {
    const followTopicSection = await this.getFollowTopicSectionPo();
    await followTopicSection.getCollapsiblePo().expand();
    await followTopicSection.getAddFolloweeButtonPo().click();

    const modal = this.getNewFolloweeModalPo();
    await modal.followNeuronId(followee);
    await modal.waitForAbsent();
  }
}
