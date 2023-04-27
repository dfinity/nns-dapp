/**
 * @jest-environment jsdom
 */

import { AppPo } from "$tests/page-objects/App.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";

// Playwright doesn't typecheck the test code or its dependencies.
// So we often have type errors in page objects that are only used in Playwright
// tests. Those page objects are typically accessed through AppPo, so by having
// a Jest test depend on AppPo, we can typecheck those page objects.
describe("AppPo", () => {
  it("Type check all page objects under AppPo", () => {
    new AppPo(new JestPageObjectElement(document.body));
  });
});
