import ToolbarTest from "$tests/lib/gix/components/ToolbarTest.svelte";
import { render } from "@testing-library/svelte";

describe("Toolbar-ui", () => {
  it("should render slots", () => {
    const { getByTestId } = render(ToolbarTest);

    expect(getByTestId("toolbar-test-start-slot")).not.toBeNull();
    expect(getByTestId("toolbar-test-slot")).not.toBeNull();
    expect(getByTestId("toolbar-test-end-slot")).not.toBeNull();
  });

  it("should be accessible by role", () => {
    const { getByRole } = render(ToolbarTest);

    expect(getByRole("toolbar")).not.toBeNull();
  });
});
