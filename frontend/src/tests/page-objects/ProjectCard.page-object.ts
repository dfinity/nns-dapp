import { CardPo } from "$tests/page-objects/Card.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { ProjectCardSwapInfoPo } from "./ProjectCardSwapInfo.page-object";

export class ProjectCardPo extends CardPo {
  private static readonly TID = "project-card-component";

  static async allUnder(element: PageObjectElement): Promise<ProjectCardPo[]> {
    return Array.from(await element.allByTestId(ProjectCardPo.TID)).map(
      (el) => new ProjectCardPo(el)
    );
  }

  static under(element: PageObjectElement): ProjectCardPo {
    return new ProjectCardPo(element.byTestId(ProjectCardPo.TID));
  }

  getProjectName(): Promise<string> {
    return this.getText("project-name");
  }

  getSwapInfoPo(): ProjectCardSwapInfoPo {
    return ProjectCardSwapInfoPo.under(this.root);
  }

  getStatus(): Promise<string> {
    return this.getSwapInfoPo().getStatus();
  }

  async getLogoSrc(): Promise<string> {
    return this.root.querySelector("img")?.getAttribute("src") ?? "";
  }

  getDescription(): Promise<string> {
    return this.getText("project-description");
  }

  hasSpinner(): Promise<boolean> {
    return this.isPresent("spinner");
  }

  getDeadline(): Promise<string> {
    return this.getSwapInfoPo().getSwapDeadline();
  }

  getUserCommitment(): Promise<string> {
    return this.getSwapInfoPo().getUserCommitment();
  }
}
