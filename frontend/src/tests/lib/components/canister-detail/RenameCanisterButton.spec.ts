/**
 * @jest-environment jsdom
 */

import { RenameCanisterButtonPo } from "$tests/page-objects/RenameCanisterButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import RenameCanisterButtonTest from "./RenameCanisterButtonTest.svelte";

describe("RenameCanisterButton", () => {
  it("emits rename canister modal event", (done) => {
    const { container, component } = render(RenameCanisterButtonTest);

    const po = RenameCanisterButtonPo.under({
      element: new JestPageObjectElement(container),
    });

    component.$on("nnsCanisterDetailModal", (data: CustomEvent) => {
      expect(data.detail).toEqual({ type: "rename" });
      done();
    });

    po.click();
  });
});
