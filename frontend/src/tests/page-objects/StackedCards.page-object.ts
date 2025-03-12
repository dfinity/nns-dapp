import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class StackedCardsPo extends BasePageObject {
  private static readonly TID = "stacked-cards-component";

  static under(element: PageObjectElement): StackedCardsPo {
    return new StackedCardsPo(element.byTestId(StackedCardsPo.TID));
  }

  getDotsContainer(): PageObjectElement {
    return this.root("dots-container");
  }

  async getCardWrappers(): Promise<PageObjectElement[]> {
    const cardWrapperPattern = /project-card-wrapper-\d+/;
    return this.getAllByTestIdPattern(cardWrapperPattern);
  }

  async getDots(): Promise<PageObjectElement[]> {
    const dotPattern = /dot-button-\d+/;
    return this.getAllByTestIdPattern(dotPattern);
  }

  async getActiveCardIndex(): Promise<number> {
    const cardWrappers = await this.getCardWrappers();
    for (let i = 0; i < cardWrappers.length; i++) {
      const hasActiveClass = await cardWrappers[i].hasClass("active");
      if (hasActiveClass) {
        return i;
      }
    }
    return -1; // No active card found
  }

  async getActiveDotIndex(): Promise<number> {
    const dots = await this.getDots();
    for (let i = 0; i < dots.length; i++) {
      const hasActiveClass = await dots[i].hasClass("active");
      if (hasActiveClass) {
        return i;
      }
    }
    return -1; // No active dot found
  }

  async clickDot(index: number): Promise<void> {
    const dots = await this.getDots();
    if (index >= 0 && index < dots.length) {
      await dots[index].click();
    } else {
      throw new Error(`Dot index ${index} out of bounds`);
    }
  }
}
