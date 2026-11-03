import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

class ImportedSnsItemPo extends BasePageObject {
  private static readonly TID = "import-sns-imported-item";

  static async allUnder(
    element: PageObjectElement
  ): Promise<ImportedSnsItemPo[]> {
    const items = await element.allByTestId(ImportedSnsItemPo.TID);
    return items.map((el) => new ImportedSnsItemPo(el));
  }

  getRemoveLabel(): Promise<string> {
    return this.getButton("import-sns-remove").getAriaLabel();
  }

  clickRemove(): Promise<void> {
    return this.getButton("import-sns-remove").click();
  }
}

export class ImportSnsUtilPo extends BasePageObject {
  private static readonly TID = "import-sns-util-component";

  static under(element: PageObjectElement): ImportSnsUtilPo {
    return new ImportSnsUtilPo(element.byTestId(ImportSnsUtilPo.TID));
  }

  enterRootCanisterId(rootCanisterId: string): Promise<void> {
    return this.getTextInput("import-sns-root-canister-id").typeText(
      rootCanisterId
    );
  }

  isCheckButtonDisabled(): Promise<boolean> {
    return this.getButton("import-sns-check").isDisabled();
  }

  clickCheck(): Promise<void> {
    return this.getButton("import-sns-check").click();
  }

  async getErrorText(): Promise<string> {
    return (
      await this.getTextWithCollapsedWhitespaces("import-sns-error")
    ).trim();
  }

  isReviewPresent(): Promise<boolean> {
    return this.isPresent("import-sns-review");
  }

  getName(): Promise<string> {
    return this.getText("import-sns-name");
  }

  getSymbol(): Promise<string> {
    return this.getText("import-sns-symbol");
  }

  clickImport(): Promise<void> {
    return this.getButton("import-sns-confirm").click();
  }

  clickBack(): Promise<void> {
    return this.getButton("import-sns-back").click();
  }

  getImportedSnsItemPos(): Promise<ImportedSnsItemPo[]> {
    return ImportedSnsItemPo.allUnder(this.root);
  }

  async getImportedSnsTexts(): Promise<string[]> {
    const items = await this.getImportedSnsItemPos();
    return Promise.all(
      items.map(async (item) =>
        (await item.getTextWithCollapsedWhitespaces()).trim()
      )
    );
  }
}
