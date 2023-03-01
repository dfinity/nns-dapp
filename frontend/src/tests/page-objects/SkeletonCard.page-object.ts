const tid = "skeleton-card";

export class SkeletonCardPo {
  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("testId") !== tid) {
      throw new Error(`${root} is not a SkeletonCard`);
    }
    this.root = root;
  }

  static allUnder(element: Element): SkeletonCardPo[] {
    return Array.from(element.querySelectorAll(`[testId=${tid}]`)).map(
      (el) => new SkeletonCardPo(el)
    );
  }
}
