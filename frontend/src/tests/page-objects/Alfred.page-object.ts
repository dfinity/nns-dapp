import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AlfredPo extends BasePageObject {
  private static readonly TID = "alfred-component";

  static under(element: PageObjectElement): AlfredPo {
    return new AlfredPo(element.byTestId(AlfredPo.TID));
  }

  async open(type: "mac" | "windows"): Promise<void> {
    switch (type) {
      case "mac":
        await this.root.keyDown("k", ["meta"]);
        break;
      case "windows":
        await this.root.keyDown("k", ["ctrl"]);
        break;
    }
  }

  async close(): Promise<void> {
    await this.root.keyDown("Escape");
  }
}
