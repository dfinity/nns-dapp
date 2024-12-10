import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TagPo extends BasePageObject {
  private static readonly TID = "tag";

  static async allUnder(element: PageObjectElement): Promise<TagPo[]> {
    return Array.from(await element.allByTestId(TagPo.TID)).map(
      (el) => new TagPo(el)
    );
  }

  async isIntentError(): Promise<boolean> {
    return (await this.root.getClasses()).includes("error");
  }

  async isIntentWarning(): Promise<boolean> {
    return (await this.root.getClasses()).includes("warning");
  }

  async isSizeLarge(): Promise<boolean> {
    return (await this.root.getClasses()).includes("tag--large");
  }
}
