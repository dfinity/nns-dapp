import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { CardPo } from "$tests/page-objects/Card.page-object";
import { LinkPo } from "$tests/page-objects/Link.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectCard2Po extends CardPo {
  private static readonly TID = "project-card-component";

  static async allUnder(element: PageObjectElement): Promise<ProjectCard2Po[]> {
    return Array.from(await element.allByTestId(ProjectCard2Po.TID)).map(
      (el) => new ProjectCard2Po(el)
    );
  }

  static under(element: PageObjectElement): ProjectCard2Po {
    return new ProjectCard2Po(element.byTestId(ProjectCard2Po.TID));
  }

  async getLogoSrc(): Promise<string> {
    return this.root.querySelector("img")?.getAttribute("src") ?? "";
  }

  getTitle(): Promise<string> {
    return this.getText("project-name");
  }

  getDescription(): Promise<string> {
    return this.getText("project-description");
  }

  getMarketCapValue(): Promise<string> {
    return this.getText("token-market-cap");
  }

  getIcpInTreasuryValue(): PageObjectElement {
    return this.root.byTestId("icp-in-treasury-value");
  }

  getParticipatedIcon(): PageObjectElement {
    return this.root.byTestId("participation-mark");
  }

  getUserCommitmentIcp(): AmountDisplayPo {
    return AmountDisplayPo.under(
      this.root.byTestId("user-commitment-icp-value")
    );
  }

  getProposalActivity(): PageObjectElement {
    return this.root.byTestId("proposal-activity");
  }

  getProposalActivityValue(): PageObjectElement {
    return this.root.byTestId("proposal-activity-value");
  }

  getProposalActivityNotAvailable(): PageObjectElement {
    return this.root.byTestId("proposal-activity-not-available");
  }

  getProposalActivityValueText(): Promise<string> {
    return this.getProposalActivityValue().getText();
  }

  getProjectLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "project-link",
    });
  }
}
