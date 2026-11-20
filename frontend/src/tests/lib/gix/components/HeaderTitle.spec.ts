import HeaderTitle from "$lib/gix/components/HeaderTitle.svelte";
import ComponentTest from "$tests/lib/gix/components/ComponentTest.svelte";
import { render } from "@testing-library/svelte";

describe("HeaderTitle", () => {
  it("should render a slotted content", () => {
    const { getByText } = render(ComponentTest, {
      props: { cmp: HeaderTitle, testId: "header-test-slot" },
    });

    expect(getByText("TEST TITLE")).toBeInTheDocument();
  });
});
