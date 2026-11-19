import TestIdWrapper from "$tests/lib/gix/components/TestIdWrapperTest.svelte";
import { render } from "@testing-library/svelte";

describe("TestIdWrapper", () => {
  const testId = "test-id";
  const childTestId = "child-test-id";

  it("should wrap component with the passed test id", () => {
    const { queryByTestId } = render(TestIdWrapper, {
      props: { testId },
    });

    expect(queryByTestId(testId)).toBeInTheDocument();
  });

  it("should render child component", () => {
    const { queryByTestId } = render(TestIdWrapper, {
      props: { testId, childTestId },
    });

    expect(queryByTestId(childTestId)).toBeInTheDocument();
  });
});
