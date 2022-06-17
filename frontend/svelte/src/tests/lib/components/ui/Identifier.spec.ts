/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Identifier from "../../../../lib/components/ui/Identifier.svelte";

describe("Identifier", () => {
  const identifier: string = "test-identifier";
  const props: { identifier: string } = { identifier };

  it("should render an identifier", () => {
    const { getByTestId, queryByRole } = render(Identifier, { props });

    const small = getByTestId("identifier");

    expect(small?.textContent).toEqual(identifier);

    const button = queryByRole("button");
    expect(button).toBeNull();
  });

  it("should render a copy button", () => {
    const { queryByRole } = render(Identifier, {
      props: { identifier, showCopy: true },
    });

    const button = queryByRole("button");

    expect(button?.getAttribute("aria-label")).toEqual(
      `Copy "${identifier}" to clipboard`
    );
  });
});
