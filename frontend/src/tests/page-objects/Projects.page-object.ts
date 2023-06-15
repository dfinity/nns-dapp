import { ProjectCardPo } from "$tests/page-objects/ProjectCard.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectsPo extends BasePageObject {
  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId: string;
  }): ProjectsPo {
    return new ProjectsPo(element.byTestId(testId));
  }

  getSkeletonCardPo(): SkeletonCardPo {
    // There are multiple but we only need one.
    return SkeletonCardPo.under(this.root);
  }

  getProjectCardPos(): Promise<ProjectCardPo[]> {
    return ProjectCardPo.allUnder(this.root);
  }

  async waitForContentLoaded(): Promise<void> {
    await this.waitFor();
    await this.getSkeletonCardPo().waitForAbsent();
  }
}
