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

  async preselectEntriesInFilterModal(labels: string[]): Promise<void> {
    // deselect all
    await this.getFilterModalPo().clickClearSelectionButton();

    // select items by text
    const filterEntries = await this.getFilterModalPo().getFilterEntryPos();
    const itemTexts = (
      await Promise.all(filterEntries.map((item) => item.getText()))
    ).map((text) => text.trim());

    for (const label of labels) {
      const index = itemTexts.findIndex((item) => item === label);
      if (index !== -1) {
        await filterEntries[index].click();
      } else {
        throw new Error(`Label "${label}" not found in filter entries`);
      }
    }

    await this.getFilterModalPo().clickConfirmButton();
    await this.getFilterModalPo().waitForClosed();
  }

  async setTopicFilter(topics: string[]): Promise<void> {
    await this.getFiltersByTopicsButtonPo().click();
    return this.preselectEntriesInFilterModal(topics);
  }

  async setStatusFilter(statuses: string[]): Promise<void> {
    await this.getFiltersByStatusButtonPo().click();
    return this.preselectEntriesInFilterModal(statuses);
  }
}
