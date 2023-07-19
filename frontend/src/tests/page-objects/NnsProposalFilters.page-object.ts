import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { FilterModalPo } from "$tests/page-objects/FilterModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsProposalFiltersPo extends BasePageObject {
  private static readonly TID = "filter-wrapper-component";

  static under(element: PageObjectElement): NnsProposalFiltersPo {
    return new NnsProposalFiltersPo(element.byTestId(NnsProposalFiltersPo.TID));
  }

  getFiltersByTopicsButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "filters-by-topics",
    });
  }

  getFiltersByRewardsdButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "filters-by-rewards",
    });
  }

  getFiltersByStatusButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "filters-by-status",
    });
  }

  getFilterModalPo(): FilterModalPo {
    return FilterModalPo.under(this.root);
  }

  async selectFilterTopics(topics: string[]): Promise<void> {
    await this.getFiltersByTopicsButtonPo().click();

    const filterModalPo = this.getFilterModalPo();
    await filterModalPo.waitFor();

    // deselect all
    await filterModalPo.getClearSelectionButtonPo().click();

    // select items by topics
    const filterEntries = await filterModalPo.getFilterEntryPos();
    const itemTexts = await Promise.all(
      filterEntries.map((item) => item.getText())
    );

    for (const topic of topics) {
      const index = itemTexts.findIndex((item) => item === topic);
      if (index !== -1) {
        await filterEntries[index].click();
      }
    }

    // TODO: confirm selection and close modal

    // TODO: wait for skeleton to disappear

    // TODO: validate filter results
  }
}
