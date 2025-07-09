import { CardFramePo } from "$tests/page-objects/CardFrame.page-object";
import { LinkPo } from "$tests/page-objects/Link.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class UpcomingProjectCardPo extends CardFramePo {
  private static readonly TID = "upcoming-project-card-component";

  static under(element: PageObjectElement): UpcomingProjectCardPo {
    return new UpcomingProjectCardPo(
      element.byTestId(UpcomingProjectCardPo.TID)
    );
  }

  getTitle(): Promise<string> {
    return this.getText("project-name");
  }

  getDescription(): Promise<string> {
    return this.getText("project-description");
  }

  getProjectSiteLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "project-site-link",
    });
  }

  getTimeRemaining(): Promise<string> {
    return this.getText("time-remaining");
  }

  getProjectLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "project-link",
    });
  }
}
