/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import InputWithError from "../../../../lib/components/ui/InputWithError.svelte";

describe("Input", () => {
  const props = { name: "name", placeholderLabelKey: "test.placeholder" };

  it("should render an input", () => {
    const { getByTestId } = render(InputWithError, {
      props,
    });

    expect(getByTestId("input-ui-element")).toBeInTheDocument();
  });

  it("should render an error message", () => {
    const errorMessage = "test error";
    const { getByText } = render(InputWithError, {
      props: { ...props, errorMessage },
    });

    expect(getByText(errorMessage)).toBeInTheDocument();
  });
});
