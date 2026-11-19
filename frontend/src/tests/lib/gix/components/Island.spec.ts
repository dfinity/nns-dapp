import { render } from "@testing-library/svelte";
import IslandTest from "./IslandTest.svelte";

describe("Island", () => {
  it("should render slotted element", () => {
    const { getByTestId } = render(IslandTest);

    expect(getByTestId("island-test-slot")).not.toBeNull();
  });
});
