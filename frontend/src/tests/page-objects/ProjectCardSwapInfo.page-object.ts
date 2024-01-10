import { CardPo } from "$tests/page-objects/Card.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectCardSwapInfoPo extends CardPo {
  private static readonly TID = "project-card-swap-info-component";

  static under(element: PageObjectElement): ProjectCardSwapInfoPo {
    return new ProjectCardSwapInfoPo(
      element.byTestId(ProjectCardSwapInfoPo.TID)
    );
  }

  async getStatus(): Promise<string> {
    return (await this.getText("project-status-text")).trim();
  }

  hasUserCommitment(): Promise<boolean> {
    return this.isPresent("commitment-token-value");
  }

  async getUserCommitment(): Promise<string | null> {
    return (await this.hasUserCommitment())
      ? this.getText("commitment-token-value")
      : null;
  }

  getSwapDeadline(): Promise<string> {
    return this.getText("project-deadline");
  }
}
