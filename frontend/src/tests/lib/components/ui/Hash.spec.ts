/**
 * @jest-environment jsdom
 */

import Hash from "$lib/components/ui/Hash.svelte";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { render } from "@testing-library/svelte";

describe("Hash", () => {
  const identifier = "12345678901234567890";
  const testId = "tests-hash";

  it("should render a hashed identifier", () => {
    const { getByTestId } = render(Hash, {
      props: { text: identifier, testId, id: identifier },
    });

    const small = getByTestId(testId);
    expect(small?.textContent).toEqual(shortenWithMiddleEllipsis(identifier));
  });

  it("should render a tooltip with all identifier", () => {
    const { container } = render(Hash, {
      props: { text: identifier, testId, id: identifier },
    });

    const tooltipElement = container.querySelector("[role='tooltip']");
    expect(tooltipElement?.textContent).toEqual(identifier);
  });

  it("should render the identifier as aria-label when copy icon", () => {
    const { container } = render(Hash, {
      props: { text: identifier, testId, id: identifier, showCopy: true },
    });

    const button = container.querySelector("button");
    expect(
      button?.getAttribute("aria-label").includes(identifier)
    ).toBeTruthy();
  });
});
