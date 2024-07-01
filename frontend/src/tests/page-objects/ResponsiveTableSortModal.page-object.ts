import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ResponsiveTableSortModalPo extends ModalPo {
  private static TID = "responsive-table-sort-modal-component";

  static under(element: PageObjectElement): ResponsiveTableSortModalPo {
    return new ResponsiveTableSortModalPo(
      element.byTestId(ResponsiveTableSortModalPo.TID)
    );
  }

  async getOptions(): Promise<string[]> {
    const elements = await this.root.allByTestId("sort-option-title");
    return Promise.all(elements.map((element) => element.getText()));
  }

  async getMatchingOption(
    filter: (PageObjectElement) => Promise<boolean>
  ): Promise<PageObjectElement> {
    const elements = await this.root.allByTestId("sort-option");
    const matchingElements = await Promise.all(
      elements.map(async (element) => ({
        element,
        isMatching: await filter(element),
      }))
    );
    const matchingCount = matchingElements.filter(
      (element) => element.isMatching
    ).length;
    if (matchingCount !== 1) {
      throw new Error(`Expected 1 matching, but found ${matchingCount}`);
    }
    return matchingElements.find((element) => element.isMatching).element;
  }

  async getOptionWithArrow(): Promise<string> {
    const element = await this.getMatchingOption(async (element) =>
      element.byTestId("arrow").isPresent()
    );
    return element.byTestId("sort-option-title").getText();
  }

  async clickOption(optionTitle: string): Promise<void> {
    const element = await this.getMatchingOption(
      async (element) =>
        (await element.byTestId("sort-option-title").getText()) === optionTitle
    );
    return element.click();
  }

  async isReversed(): Promise<boolean> {
    return (await this.root.byTestId("arrow").getClasses()).includes(
      "reversed"
    );
  }
}
