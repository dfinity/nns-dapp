import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NoStakedTokensCardPo extends BasePageObject {
  private static readonly TID = "no-staked-tokens-card";

  static under(element: PageObjectElement): NoStakedTokensCardPo {
    return new NoStakedTokensCardPo(element.byTestId(NoStakedTokensCardPo.TID));
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
