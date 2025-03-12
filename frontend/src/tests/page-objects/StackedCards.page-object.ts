import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

class ProjectCardWrapperPo extends BasePageObject {
  private static readonly TID = "project-card-wrapper";

  static async allUnder(
    element: PageObjectElement
  ): Promise<ProjectCardWrapperPo[]> {
    const cards = await element.allByTestId(ProjectCardWrapperPo.TID);
    return cards.map((el) => new ProjectCardWrapperPo(el));
  }

  async isActive(): Promise<boolean> {
    const classNames = await this.root.getClasses();
    return classNames.includes("active");
  }
}

class DotButtonPo extends ButtonPo {
  private static readonly TID = "dot-button";

  static async allUnder(element: PageObjectElement): Promise<DotButtonPo[]> {
    const dots = await element.allByTestId(DotButtonPo.TID);
    return dots.map((el) => new DotButtonPo(el));
  }

  async isActive(): Promise<boolean> {
    const classNames = await this.root.getClasses();

    return classNames.includes("active");
  }
}

export class StackedCardsPo extends BasePageObject {
  private static readonly TID = "stacked-cards-component";

  static under(element: PageObjectElement): StackedCardsPo {
    return new StackedCardsPo(element.byTestId(StackedCardsPo.TID));
  }

  async getCardWrappers(): Promise<ProjectCardWrapperPo[]> {
    return ProjectCardWrapperPo.allUnder(this.root);
  }

  async getActiveCardIndex(): Promise<number> {
    const cardWrappers = await this.getCardWrappers();

    for (const wrapper of cardWrappers) {
      if (await wrapper.isActive()) {
        return cardWrappers.indexOf(wrapper);
      }
    }
    return -1;
  }

  async getDots(): Promise<DotButtonPo[]> {
    return DotButtonPo.allUnder(this.root);
  }

  async getActiveDotIndex(): Promise<number> {
    const dots = await this.getDots();
    for (const dot of dots) {
      if (await dot.isActive()) {
        return dots.indexOf(dot);
      }
    }
    return -1;
  }
}
