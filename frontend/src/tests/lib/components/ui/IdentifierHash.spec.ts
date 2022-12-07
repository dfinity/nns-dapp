/**
 * @jest-environment jsdom
 */

import IdentifierHash from "$lib/components/ui/IdentifierHash.svelte";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { render } from "@testing-library/svelte";

describe("IdentifierHash", () => {
  const identifier = "12345678901234567890";

  it("should render a hashed identifier", () => {
    const { getByTestId } = render(IdentifierHash, {
      props: { identifier },
    });

    const small = getByTestId("identifier");
    expect(small?.textContent).toEqual(shortenWithMiddleEllipsis(identifier));
  });

  it("should render the identifier as aria-label", () => {
    const { container } = render(IdentifierHash, {
      props: { identifier },
    });

    const button = container.querySelector("button");
    expect(
      button?.getAttribute("aria-label").includes(identifier)
    ).toBeTruthy();
  });
});
