import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NoTokesStakedCardPo extends BasePageObject {
  private static readonly TID = "no-neurons-card";

  static under(element: PageObjectElement): NoTokesStakedCardPo {
    return new NoTokesStakedCardPo(element.byTestId(NoTokesStakedCardPo.TID));
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
