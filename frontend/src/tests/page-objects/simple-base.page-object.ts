import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish } from "@dfinity/utils";

// Most page objects should extends BasePageObject instead.
export class SimpleBasePageObject {
  readonly root: PageObjectElement;

  constructor(root: PageObjectElement) {
    this.root = root;
  }

  isPresent(): Promise<boolean> {
    return this.root.isPresent();
  }

  waitFor(): Promise<void> {
    return this.root.waitFor();
  }

  waitForAbsent(timeout?: number): Promise<void> {
    return this.root.waitForAbsent(timeout);
  }

  click(tid: string | undefined = undefined): Promise<void> {
    if (isNullish(tid)) {
      return this.root.click();
    }
    return this.root.byTestId(tid).click();
  }

  getText(tid: string | undefined = undefined): Promise<string> {
    if (isNullish(tid)) {
      return this.root.getText();
    }
    return this.root.byTestId(tid).getText();
  }
}
