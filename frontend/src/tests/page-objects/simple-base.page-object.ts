import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish } from "@dfinity/utils";

// Most page objects should extend BasePageObject instead.
export class SimpleBasePageObject {
  readonly root: PageObjectElement;

  constructor(root: PageObjectElement) {
    this.root = root;
  }

  getElement(tid: string | undefined = undefined): PageObjectElement {
    if (isNullish(tid)) {
      return this.root;
    }
    return this.root.byTestId(tid);
  }

  isPresent(tid: string | undefined = undefined): Promise<boolean> {
    return this.getElement(tid).isPresent();
  }

  waitFor(tid: string | undefined = undefined): Promise<void> {
    return this.getElement(tid).waitFor();
  }

  waitForAbsent(tid: string | undefined = undefined): Promise<void> {
    return this.getElement(tid).waitForAbsent();
  }

  click(tid: string | undefined = undefined): Promise<void> {
    return this.getElement(tid).click();
  }

  getText(tid: string | undefined = undefined): Promise<string> {
    return this.getElement(tid).getText();
  }

  getStyle(): Promise<string> {
    return this.root.getAttribute("style");
  }
}
