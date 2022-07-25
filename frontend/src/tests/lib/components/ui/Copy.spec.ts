/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import Copy from "../../../../lib/components/ui/Copy.svelte";

describe("Copy", () => {
  const value: string = "test-copy";
  const props: { value: string } = { value };

  it("should render an accessible button", () => {
    const { queryByRole } = render(Copy, {
      props,
    });

    const button = queryByRole("button");

    expect(button?.getAttribute("aria-label")).toEqual(
      `Copy "${value}" to clipboard`
    );
  });

  it("should copy value to clipboard", () => {
    const { getByRole } = render(Copy, {
      props,
    });

    Object.assign(window.navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    const button = getByRole("button");
    fireEvent.click(button);

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(value);
  });
});
