import StretchPaneTest from "$tests/lib/gix/components/StretchPaneTest.svelte";
import { render } from "@testing-library/svelte";

describe("StretchPane", () => {
  it("should render slotted elements", () => {
    const { getByTestId } = render(StretchPaneTest);

    expect(getByTestId("stretch-pane-test-slot")).not.toBeNull();
    expect(getByTestId("stretch-pane-test-menu-slot")).not.toBeNull();
  });
});
