import { BasePortfolioCardPo } from "$tests/page-objects/BasePortfolioCard.page-object";
import { LinkPo } from "$tests/page-objects/Link.page-object";
import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class LaunchProjectCardPo extends BasePortfolioCardPo {
  private static readonly TID = "launch-project-card";

  static under(element: PageObjectElement): LaunchProjectCardPo {
    return new LaunchProjectCardPo(element.byTestId(LaunchProjectCardPo.TID));
  }

  getTitle(): Promise<string> {
    return this.getText("project-name");
  }

  getDescription(): Promise<string> {
    return this.getText("project-description");
  }

  getDirectCommitment(): Promise<string> {
    return this.getText("direct-commitment");
  }

  getMinIcp(): Promise<string> {
    return this.getText("min-direct-commitment");
  }

  getMaxIcp(): Promise<string> {
    return this.getText("max-direct-commitment");
  }

  async getNfParticipation(): Promise<string | null> {
    try {
      return await this.getText("nf-commitment");
    } catch (_) {
      return null;
    }
  }

  async hasNfParticipation(): Promise<boolean> {
    try {
      return await this.isPresent("nf-commitment-field");
    } catch (_) {
      return false;
    }
  }

  getTimeRemaining(): Promise<string> {
    return this.getText("time-remaining");
  }

  getLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "project-link",
    });
  }

  getNFTooltipPo(): TooltipPo {
    return TooltipPo.under(this.root);
  }
}
