import { BasePageObject } from "$tests/page-objects/base.page-object";
import { ProjectsPo } from "$tests/page-objects/Projects.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class LaunchpadPo extends BasePageObject {
  private static readonly TID = "launchpad-component";

  static under(element: PageObjectElement): LaunchpadPo {
    return new LaunchpadPo(element.byTestId(LaunchpadPo.TID));
  }

  getOpenProjectsPo(): ProjectsPo {
    return ProjectsPo.under({ element: this.root, testId: "open-projects" });
  }

  getCommittedProjectsPo(): ProjectsPo {
    return ProjectsPo.under({
      element: this.root,
      testId: "committed-projects",
    });
  }
}
