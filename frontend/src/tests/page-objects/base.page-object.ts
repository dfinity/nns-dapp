import type { PageObjectElement } from "$tests/types/page-object.types";

export class BasePageObject {
  readonly root: PageObjectElement;

  constructor(root: PageObjectElement) {
    this.root = root;
  }

  isPresent(): Promise<boolean> {
    return this.root.isPresent();
  }
}
