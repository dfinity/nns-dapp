import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { LinkToDashboardCanisterPo } from "$tests/page-objects/LinkToDashboardCanister.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ImportTokenCanisterIdPo extends BasePageObject {
  private static readonly TID = "import-token-canister-id-component";

  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId?: string;
  }): ImportTokenCanisterIdPo {
    return new ImportTokenCanisterIdPo(
      element.byTestId(testId ?? ImportTokenCanisterIdPo.TID)
    );
  }

  getLabel(): PageObjectElement {
    return this.root.byTestId("label");
  }

  getCanisterId(): PageObjectElement {
    return this.root.byTestId("canister-id");
  }

  getCanisterIdFallback(): PageObjectElement {
    return this.root.byTestId("canister-id-fallback");
  }

  getLabelText(): Promise<string> {
    return this.getLabel().getText();
  }

  getCanisterIdText(): Promise<string> {
    return this.getCanisterId().getText();
  }

  getCopyButtonPo(): ButtonPo {
    return this.getButton("copy-component");
  }

  getLinkToDashboardCanisterPo(): LinkToDashboardCanisterPo {
    return LinkToDashboardCanisterPo.under({
      element: this.root,
    });
  }

  getCanisterIdFallbackText(): Promise<string> {
    return this.getCanisterIdFallback().getText();
  }
}
