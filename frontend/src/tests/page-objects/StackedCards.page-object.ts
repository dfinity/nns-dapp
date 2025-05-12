import { AdoptedProposalCardPo } from "$tests/page-objects/AdoptedProposalCard.page-object";
import type { BasePortfolioCardPo } from "$tests/page-objects/BasePortfolioCard.page-object";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { LaunchProjectCardPo } from "$tests/page-objects/LaunchProjectCard.page-object";
import { NewSnsProposalCardPo } from "$tests/page-objects/NewSnsProposalCard.page-object";
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

class NavigationButtonPo extends ButtonPo {
  static prev(element: PageObjectElement): NavigationButtonPo {
    return new NavigationButtonPo(element.byTestId("prev-button"));
  }

  static next(element: PageObjectElement): NavigationButtonPo {
    return new NavigationButtonPo(element.byTestId("next-button"));
  }
}

class DotsContainerPo extends BasePageObject {
  private static readonly TID = "dots-container";

  static under(element: PageObjectElement): DotsContainerPo | null {
    try {
      return new DotsContainerPo(element.byTestId(DotsContainerPo.TID));
    } catch {
      return null;
    }
  }

  async getDots(): Promise<DotButtonPo[]> {
    return DotButtonPo.allUnder(this.root);
  }
}

class ButtonsContainerPo extends BasePageObject {
  private static readonly TID = "buttons-container";

  static under(element: PageObjectElement): ButtonsContainerPo | null {
    try {
      return new ButtonsContainerPo(element.byTestId(ButtonsContainerPo.TID));
    } catch {
      return null;
    }
  }

  getPrevButton(): NavigationButtonPo {
    return NavigationButtonPo.prev(this.root);
  }

  getNextButton(): NavigationButtonPo {
    return NavigationButtonPo.next(this.root);
  }

  async getDisplayedCurrentIndex(): Promise<number> {
    const indexText = await this.root.byTestId("activeIndex").getText();
    return parseInt(indexText, 10);
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

  async getDotsContainerPo(): Promise<DotsContainerPo | null> {
    return DotsContainerPo.under(this.root);
  }

  async getButtonsContainerPo(): Promise<ButtonsContainerPo | null> {
    return ButtonsContainerPo.under(this.root);
  }

  async getPrevButton(): Promise<NavigationButtonPo | null> {
    const buttonsContainer = await this.getButtonsContainerPo();
    return buttonsContainer ? buttonsContainer.getPrevButton() : null;
  }

  async getNextButton(): Promise<NavigationButtonPo | null> {
    const buttonsContainer = await this.getButtonsContainerPo();
    return buttonsContainer ? buttonsContainer.getNextButton() : null;
  }

  async getCurrentIndexDisplay(): Promise<number | null> {
    const buttonsContainer = await this.getButtonsContainerPo();
    return buttonsContainer
      ? await buttonsContainer.getDisplayedCurrentIndex()
      : null;
  }

  async getActiveCardPo(): Promise<BasePortfolioCardPo> {
    const activeIndex = await this.getActiveCardIndex();
    const cardWrappers = await this.getCardWrappers();
    let activeCard: BasePortfolioCardPo;

    activeCard = LaunchProjectCardPo.under(cardWrappers[activeIndex].root);
    if (await activeCard.isPresent()) return activeCard;

    activeCard = NewSnsProposalCardPo.under(cardWrappers[activeIndex].root);
    if (await activeCard.isPresent()) return activeCard;

    activeCard = AdoptedProposalCardPo.under(cardWrappers[activeIndex].root);
    if (await activeCard.isPresent()) return activeCard;

    return null;
  }
}
