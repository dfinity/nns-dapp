import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { LinkPo } from "./Link.page-object";

export class LaunchProjectCardPo extends BasePageObject {
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
    return this.getText("min-icp-amount");
  }

  getMaxIcp(): Promise<string> {
    return this.getText("max-icp-amount");
  }

  async getNfParticipation(): Promise<string | null> {
    try {
      return await this.getText("nf-participation-amount");
    } catch (_) {
      return null;
    }
  }

  async hasNfParticipation(): Promise<boolean> {
    try {
      return await this.isPresent("nf-participation-amount");
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
      testId: "project-link-text",
    });
  }
}
