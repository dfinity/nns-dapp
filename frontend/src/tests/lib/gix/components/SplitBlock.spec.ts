import SplitBlockTest from "$tests/lib/gix/components/SplitBlockTest.svelte";
import { render } from "@testing-library/svelte";

describe("SplitBlock", () => {
  it("should render slotted elements", () => {
    const { getByTestId } = render(SplitBlockTest);

    expect(getByTestId("content-test-start-slot")).not.toBeNull();
    expect(getByTestId("content-test-end-slot")).not.toBeNull();
  });
});
