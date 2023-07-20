import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { FilterModalPo } from "$tests/page-objects/FilterModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsProposalFiltersPo extends BasePageObject {
  private static readonly TID = "nns-proposals-filters-component";

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

  async setTopicFilter(topics: string[]): Promise<void> {
    await this.getFiltersByTopicsButtonPo().click();

    // deselect all
    await this.getFilterModalPo().clickClearSelectionButton();

    // select items by topics
    const filterEntries = await this.getFilterModalPo().getFilterEntryPos();
    const itemTexts = (
      await Promise.all(filterEntries.map((item) => item.getText()))
    ).map((text) => text.trim());

    for (const topic of topics) {
      const index = itemTexts.findIndex((item) => item === topic);
      if (index !== -1) {
        await filterEntries[index].click();
      }
    }

    await this.getFilterModalPo().clickConfirmButton();
    await this.getFilterModalPo().waitForClosed();
  }
}
