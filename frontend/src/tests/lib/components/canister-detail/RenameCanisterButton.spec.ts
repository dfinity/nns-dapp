/**
 * @jest-environment jsdom
 */

import RenameCanisterButton from "$lib/components/canister-detail/RenameCanisterButton.svelte";
import { RenameCanisterButtonPo } from "$tests/page-objects/RenameCanisterButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("RenameCanisterButton", () => {
  it("emits rename canister modal event", (done) => {
    const { container } = render(RenameCanisterButton);

    const po = RenameCanisterButtonPo.under({
      element: new JestPageObjectElement(container),
    });

    window.addEventListener("nnsCanisterDetailModal", (event: CustomEvent) => {
      expect(event.detail).toEqual({ type: "rename" });
      done();
    });

    po.click();
  });
});
