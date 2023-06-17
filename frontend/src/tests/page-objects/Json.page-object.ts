import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class JsonPo extends BasePageObject {
  static readonly tid = "json-root-component";

  static async allUnder(element: PageObjectElement): Promise<JsonPo[]> {
    return Array.from(await element.allByTestId(JsonPo.tid)).map(
      (el) => new JsonPo(el)
    );
  }

  getText(): Promise<string> {
    return this.root.getText();
  }
}
