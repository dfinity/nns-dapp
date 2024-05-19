import { ActionableProposalCountBadgePo } from "$tests/page-objects/ActionableProposalCountBadge.page-object";
import { CardPo } from "$tests/page-objects/Card.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SelectActionableCardPo extends CardPo {
  private static readonly TID = "select-actionable-card-component";

  static under(element: PageObjectElement): SelectActionableCardPo {
    return new SelectActionableCardPo(
      element.byTestId(SelectActionableCardPo.TID)
    );
  }

  // get cardPo
  getCardPo(): CardPo {
    return new CardPo(this.root);
  }

  hasSeparator(): Promise<boolean> {
    return this.isPresent("separator");
  }

  getTotalActionableProposalCountBadgePo(): ActionableProposalCountBadgePo {
    return;
  }

  hasTotalActionableProposalCount(): Promise<boolean> {
    return this.getTotalActionableProposalCountBadgePo().isPresent();
  }

  getTotalActionableProposalCount(): Promise<string> {
    return ActionableProposalCountBadgePo.under(this.root).getText();
  }
}
