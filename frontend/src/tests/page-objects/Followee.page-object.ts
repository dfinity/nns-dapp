import { TagPo } from "$tests/page-objects/Tag.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FolloweePo extends BasePageObject {
  private static readonly TID = "followee-component";

  static under(element: PageObjectElement): FolloweePo {
    return new FolloweePo(element.byTestId(FolloweePo.TID));
  }

  getTagPos(): Promise<TagPo[]> {
    return TagPo.allUnder(this.root);
  }

  getName(): Promise<string> {
    return this.getButton().getText();
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
}
