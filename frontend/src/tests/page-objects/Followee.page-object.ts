import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { TagPo } from "$tests/page-objects/Tag.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FolloweePo extends BasePageObject {
  private static readonly TID = "followee-component";

  static under(element: PageObjectElement): FolloweePo {
    return new FolloweePo(element.byTestId(FolloweePo.TID));
  }

  static async allUnder(element: PageObjectElement): Promise<FolloweePo[]> {
    return Array.from(
      (await element.allByTestId(FolloweePo.TID)).map(
        (el) => new FolloweePo(el)
      )
    );
  }

  getTagPos(): Promise<TagPo[]> {
    return TagPo.allUnder(this.root);
  }

  getCopyButton(): ButtonPo {
    return this.getButton("copy-component");
  }

  getName(): Promise<string> {
    return this.getText("title");
  }

  async getTags(): Promise<string[]> {
    const pos = await this.getTagPos();
    return Promise.all(pos.map((po) => po.getText()));
  }

  getId(): Promise<string> {
    return this.getButton().root.getAttribute("id");
  }

  getAriaLabeledBy(): Promise<string> {
    return this.root.querySelector("ul").getAttribute("aria-labelledby");
  }

  openModal(): Promise<void> {
    return this.getButton().click();
  }

  copy(): Promise<void> {
    return this.getCopyButton().click();
  }
}
