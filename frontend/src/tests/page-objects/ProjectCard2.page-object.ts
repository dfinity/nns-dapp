import { CardPo } from "$tests/page-objects/Card.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { AmountDisplayPo } from "./AmountDisplay.page-object";
import { LinkPo } from "./Link.page-object";

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

  getTokenPriceValue(): Promise<string> {
    return this.getText("token-price-value");
  }

  getIcpInTreasuryValue(): Promise<string> {
    return this.getText("icp-in-treasury-value");
  }

  getUserCommitmentIcp(): AmountDisplayPo {
    return AmountDisplayPo.under(
      this.root.byTestId("user-commitment-icp-value")
    );
  }

  getProposalActivity(): PageObjectElement {
    return this.root.byTestId("proposal-activity-value");
  }

  getProposalActivityValue(): Promise<string> {
    return this.getProposalActivity().getText();
  }

  getProjectLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "project-link",
    });
  }
}
