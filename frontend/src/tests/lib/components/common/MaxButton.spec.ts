import MaxButton from "$lib/components/common/MaxButton.svelte";
import { render } from "$tests/utils/svelte.test-utils";
import { fireEvent } from "@testing-library/svelte";

describe("MaxButton", () => {
  it("should render a button", () => {
    const { container } = render(MaxButton);
    expect(container.querySelector("button")).toBeInTheDocument();
  });

  it("should render an icon", () => {
    const { queryByTestId } = render(MaxButton);
    expect(queryByTestId("icon-subdirectory")).toBeInTheDocument();
  });

  it("should trigger on click event", () =>
    new Promise<void>((done) => {
      const { container } = render(MaxButton, {
        props: {},
        events: {
          click: () => done(),
        },
      });
      const buttonElement = container.querySelector("button");
      buttonElement && fireEvent.click(buttonElement);
    }));
});
