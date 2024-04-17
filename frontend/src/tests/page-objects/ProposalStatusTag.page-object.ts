import type { UniversalProposalStatus } from "$lib/types/proposals";
import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProposalStatusTagPo extends BasePageObject {
  private static readonly TID = "proposal-status-tag";

  static under(element: PageObjectElement): ProposalStatusTagPo {
    return new ProposalStatusTagPo(element.byTestId(ProposalStatusTagPo.TID));
  }

  getActionableStatusBadgeElement(): PageObjectElement {
    return this.root.byTestId("actionable-status-badge");
  }

  getActionableStatusBadgeTooltip(): TooltipPo {
    return TooltipPo.under(this.getActionableStatusBadgeElement());
  }

  async hasStatusClass(className: UniversalProposalStatus): Promise<boolean> {
    const classNames = await this.root.getClasses();
    return classNames.includes(className);
  }

  async hasActionableStatusBadge(): Promise<boolean> {
    return this.getActionableStatusBadgeElement()
      .querySelector(".actionable-status-badge")
      .isPresent();
  }
}
