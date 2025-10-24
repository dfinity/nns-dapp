import { HashPo } from "$tests/page-objects//Hash.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowNnsNeuronsByTopicFolloweePo extends BasePageObject {
  private static readonly TID =
    "follow-nns-neurons-by-topic-followee-component";

  static under(element: PageObjectElement): FollowNnsNeuronsByTopicFolloweePo {
    return new FollowNnsNeuronsByTopicFolloweePo(
      element.byTestId(FollowNnsNeuronsByTopicFolloweePo.TID)
    );
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<FollowNnsNeuronsByTopicFolloweePo[]> {
    return (
      await element.allByTestId(FollowNnsNeuronsByTopicFolloweePo.TID)
    ).map((element) => new FollowNnsNeuronsByTopicFolloweePo(element));
  }

  getNeuronHashPo(): HashPo {
    return HashPo.under(this.root);
  }

  hasRemoveButton(): Promise<boolean> {
    return this.getButton("remove-button").isPresent();
  }

  clickRemoveButton(): Promise<void> {
    return this.click("remove-button");
  }
}
