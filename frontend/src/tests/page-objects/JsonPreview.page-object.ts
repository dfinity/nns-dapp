import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class JsonPreviewPo extends BasePageObject {
  static readonly TID = "json-preview-component";

  static under(element: PageObjectElement): JsonPreviewPo {
    return new JsonPreviewPo(element.byTestId(JsonPreviewPo.TID));
  }

  getTreeJson(): PageObjectElement {
    return this.root.byTestId("tree-json");
  }

  getRawJson(): PageObjectElement {
    return this.root.byTestId("raw-json");
  }

  getExpandButton(): ButtonPo {
    return this.getButton("expand-tree");
  }

  clickExpand(): Promise<void> {
    return this.getExpandButton().click();
  }

  async getTreeText(): Promise<string> {
    return (await this.getTreeJson().getText())?.trim();
  }

  async getRawText(): Promise<string> {
    return (await this.getRawJson().getText())?.trim();
  }
}
