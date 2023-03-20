export class ButtonPo {
  root: Element;

  constructor(root: Element) {
    if (root.tagName !== "BUTTON") {
      throw new Error(`${root} is not a button`);
    }
    this.root = root;
  }

  static under({
    element,
    testId,
  }: {
    element: Element;
    testId: string;
  }): ButtonPo | null {
    const el = element.querySelector(`button[data-tid=${testId}]`);
    return el && new ButtonPo(el);
  }
}
