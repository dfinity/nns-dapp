import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "$tests/page-objects/base.page-object";

export class NoNeuronsCardPo extends BasePageObject {
  private static readonly TID = "no-neurons-card";

  static under(element: PageObjectElement): NoNeuronsCardPo {
    return new NoNeuronsCardPo(element.byTestId(NoNeuronsCardPo.TID));
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
