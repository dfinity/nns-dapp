import IslandTest from "$tests/lib/gix/components/IslandTest.svelte";
import { render } from "@testing-library/svelte";

describe("Island", () => {
  it("should render slotted element", () => {
    const { getByTestId } = render(IslandTest);

    expect(getByTestId("island-test-slot")).not.toBeNull();
  });
});
