import { SkeletonDetailsPo } from "$tests/page-objects/SkeletonDetails.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectMetadataSectionPo extends BasePageObject {
  private static readonly TID = "project-metadata-section-component";

  static under(element: PageObjectElement): ProjectMetadataSectionPo {
    return new ProjectMetadataSectionPo(
      element.byTestId(ProjectMetadataSectionPo.TID)
    );
  }

  getSkeletonDetailsPo(): SkeletonDetailsPo {
    return SkeletonDetailsPo.under(this.root);
  }

  getProjectName(): Promise<string> {
    return this.getText("project-name");
  }

  async waitForContentLoaded(): Promise<void> {
    await this.waitFor();
    await this.getSkeletonDetailsPo().waitForAbsent();
  }
}
