/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import Identifier from "../../../../lib/components/ic/Identifier.svelte";

describe("Identifier", () => {
  const identifier: string = "test-identifier";
  const props: { identifier: string } = { identifier };

  it("should render an identifier", () => {
    const { container, queryByRole } = render(Identifier, { props });

    const small = container.querySelector("small");
    expect(small).not.toBeNull();
    expect(small.textContent).toEqual(identifier);

    const button = queryByRole("button");
    expect(button).toBeNull();
  });

  it("should render an accessible button", () => {
    const { queryByRole } = render(Identifier, {
      props: { identifier, showCopy: true },
    });

    const button = queryByRole("button");

    expect(button).not.toBeNull();
    expect(button.getAttribute("aria-label")).toEqual(
      "Copy identifier to clipboard"
    );
  });

  it("should copy identifier to clipboard", () => {
    const { getByRole } = render(Identifier, {
      props: { identifier, showCopy: true },
    });

    Object.assign(window.navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    const button = getByRole("button");
    fireEvent.click(button);

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
      identifier
    );
  });
});
