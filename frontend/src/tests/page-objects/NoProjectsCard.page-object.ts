import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NoProjectsCardPo extends BasePageObject {
  private static readonly TID = "no-neurons-card";

  static under(element: PageObjectElement): NoProjectsCardPo {
    return new NoProjectsCardPo(element.byTestId(NoProjectsCardPo.TID));
  }

  async hasPrimaryAction(): Promise<boolean> {
    const classes = await this.root.querySelector("a").getClasses();
    return classes.includes("primary");
  }

  async hasSecondaryAction(): Promise<boolean> {
    const classes = await this.root.querySelector("a").getClasses();
    return classes.includes("secondary");
  }
}
