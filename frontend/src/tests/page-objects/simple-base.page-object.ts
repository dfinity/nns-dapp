import type { PageObjectElement } from "$tests/types/page-object.types";

// Most page objects should extends BasePageObject instead.
export class SimpleBasePageObject {
  readonly root: PageObjectElement;

  constructor(root: PageObjectElement) {
    this.root = root;
  }

  isPresent(): Promise<boolean> {
    return this.root.isPresent();
  }

  waitFor(): Promise<boolean> {
    return this.root.waitFor();
  }

  waitForAbsent(): Promise<boolean> {
    return this.root.waitForAbsent();
  }
}
