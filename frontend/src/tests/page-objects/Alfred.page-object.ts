import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

class AlfredResultPo extends BasePageObject {
  private static readonly TID = "alfred-result";

  static async allUnder(element: PageObjectElement): Promise<AlfredResultPo[]> {
    const results = await element.allByTestId(AlfredResultPo.TID);
    return results.map((el) => new AlfredResultPo(el));
  }

  async select(): Promise<void> {
    await this.getElement("alfred-result-button").click();
  }

  async getTitle(): Promise<string> {
    return this.getElement("alfred-result-title").getText();
  }
}

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

  async getResultsPo(): Promise<AlfredResultPo[]> {
    return AlfredResultPo.allUnder(this.root);
  }

  async type(input: string): Promise<void> {
    await this.getElement("alfred-input").typeText(input);
  }

  async getResultsTitle(): Promise<string[]> {
    const results = await this.getResultsPo();
    const presentResults = await Promise.all(
      results.filter((result) => result.isPresent())
    );

    return await Promise.all(presentResults.map((result) => result.getTitle()));
  }
}
