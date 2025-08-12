import { BasePageObject } from "$tests/page-objects/base.page-object";
import { CardListPo } from "$tests/page-objects/CardList.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class Launchpad2Po extends BasePageObject {
  private static readonly TID = "launchpad2-component";

  static under(element: PageObjectElement): Launchpad2Po {
    return new Launchpad2Po(element.byTestId(Launchpad2Po.TID));
  }

  getUpcomingLaunchesCardListPo(): CardListPo {
    return CardListPo.under({
      element: this.root,
      testId: "upcoming-launches-list",
    });
  }

  getFeaturedProjectsCardListPo(): CardListPo {
    return CardListPo.under({
      element: this.root,
      testId: "featured-projects-list",
    });
  }

  getRestProjectsCardListPo(): CardListPo {
    return CardListPo.under({
      element: this.root,
      testId: "rest-projects-list",
    });
  }

  getSkeletonProjectsCardListPo(): CardListPo {
    return CardListPo.under({
      element: this.root,
      testId: "skeleton-projects-list",
    });
  }
}
