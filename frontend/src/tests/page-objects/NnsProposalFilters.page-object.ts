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

  async selectEntriesInFilterModal(ids: string[]): Promise<void> {
    // deselect all
    await this.getFilterModalPo().clickClearSelectionButton();

    // select items by testIds
    for (const id of ids) {
      const filterEntry = this.getFilterModalPo().getFilterEntryByIdPo(
        `filter-modal-option-${id}`
      );
      await filterEntry.click();
    }

    // confirm and close modal
    await this.getFilterModalPo().clickConfirmButton();
    await this.getFilterModalPo().waitForAbsent();
  }

  async selectAllEntriesInFilterModalExcept(
    exceptionIds: string[] = []
  ): Promise<void> {
    await this.getFilterModalPo().clickSelectAllButton();

    for (const testId of exceptionIds.map(
      (value) => `filter-modal-option-${value}`
    )) {
      const filterEntry = this.getFilterModalPo().getFilterEntryByIdPo(testId);
      await filterEntry.click();
    }

    // confirm and close modal
    await this.getFilterModalPo().clickConfirmButton();
    await this.getFilterModalPo().waitForAbsent();
  }

  async selectAllTopicsExcept(exceptions: Topic[] = []): Promise<void> {
    await this.clickFiltersByTopicsButton();
    await this.selectAllEntriesInFilterModalExcept(
      exceptions.map((topic) => `${topic}`)
    );
  }

  async selectAllStatusesExcept(
    exceptions: ProposalStatus[] = []
  ): Promise<void> {
    await this.clickFiltersByStatusButton();
    await this.selectAllEntriesInFilterModalExcept(
      exceptions.map((status) => `${status}`)
    );
  }

  async selectTopicFilter(topics: Topic[]): Promise<void> {
    await this.clickFiltersByTopicsButton();
    return this.selectEntriesInFilterModal(topics.map((value) => `${value}`));
  }

  async selectStatusFilter(statuses: ProposalStatus[]): Promise<void> {
    await this.clickFiltersByStatusButton();
    return this.selectEntriesInFilterModal(statuses.map((value) => `${value}`));
  }
}
