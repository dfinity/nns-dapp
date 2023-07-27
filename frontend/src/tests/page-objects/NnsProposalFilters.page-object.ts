import { FilterModalPo } from "$tests/page-objects/FilterModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import type { ProposalStatus, Topic } from "@dfinity/nns";

export class NnsProposalFiltersPo extends BasePageObject {
  private static readonly TID = "nns-proposals-filters-component";

  static under(element: PageObjectElement): NnsProposalFiltersPo {
    return new NnsProposalFiltersPo(element.byTestId(NnsProposalFiltersPo.TID));
  }

  clickFiltersByTopicsButton(): Promise<void> {
    return this.click("filters-by-topics");
  }

  clickFiltersByStatusButton(): Promise<void> {
    return this.click("filters-by-status");
  }

  getFilterModalPo(): FilterModalPo {
    return FilterModalPo.under(this.root);
  }

  async preselectEntriesInFilterModal(testIds: string[]): Promise<void> {
    // deselect all
    await this.getFilterModalPo().clickClearSelectionButton();

    // select items by testIds
    for (const testId of testIds) {
      const filterEntry = this.getFilterModalPo().getFilterEntryByIdPo(testId);
      await filterEntry.click();
    }

    // confirm and close modal
    await this.getFilterModalPo().clickConfirmButton();
    await this.getFilterModalPo().waitForAbsent();
  }

  async setTopicFilter(topics: Topic[]): Promise<void> {
    await this.clickFiltersByTopicsButton();
    return this.preselectEntriesInFilterModal(
      topics.map((value) => `checkbox-${value}`)
    );
  }

  async setStatusFilter(statuses: ProposalStatus[]): Promise<void> {
    await this.clickFiltersByStatusButton();
    return this.preselectEntriesInFilterModal(
      statuses.map((value) => `checkbox-${value}`)
    );
  }
}
