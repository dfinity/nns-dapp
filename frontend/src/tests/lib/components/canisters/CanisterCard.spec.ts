/**
 * @jest-environment jsdom
 */

import CanisterCard from "$lib/components/canisters/CanisterCard.svelte";
import { mockCanister } from "$tests/mocks/canisters.mock";
import { render } from "@testing-library/svelte";

jest.mock("$lib/services/worker-cycles.services", () => ({
  initCyclesWorker: jest.fn(() =>
    Promise.resolve({
      startCyclesTimer: () => {
        // Do nothing
      },
      stopCyclesTimer: () => {
        // Do nothing
      },
    })
  ),
}));

describe("CanisterCard", () => {
  const href = "https://test.com";

  it("renders a Card", () => {
    const { queryByTestId } = render(CanisterCard, {
      props: { canister: mockCanister, href },
    });

    const element = queryByTestId("canister-card");
    expect(element).toBeInTheDocument();
  });

  it("renders aria-label passed", () => {
    const ariaLabel = "test label";
    const { getByTestId } = render(CanisterCard, {
      props: {
        canister: mockCanister,
        ariaLabel,
        href,
      },
    });

    const articleElement = getByTestId("canister-card");
    expect(articleElement?.getAttribute("aria-label")).toBe(ariaLabel);
  });

  it("should render a hyperlink", () => {
    const { getByTestId } = render(CanisterCard, {
      props: {
        canister: mockCanister,
        href,
      },
    });

    const linkElement = getByTestId("canister-card");
    expect(linkElement?.tagName.toLowerCase()).toEqual("a");
    expect(linkElement?.getAttribute("href")).toEqual(href);
  });

  it("renders the canister id", async () => {
    const { queryAllByText } = render(CanisterCard, {
      props: {
        canister: mockCanister,
        href,
      },
    });
    expect(
      queryAllByText(mockCanister.canister_id.toText()).length
    ).toBeGreaterThan(0);
  });

  it("renders copy if no name present", async () => {
    const { queryByRole } = render(CanisterCard, {
      props: {
        canister: { ...mockCanister },
        href,
      },
    });

    const button = queryByRole("button");

    expect(button?.getAttribute("aria-label")).toEqual(
      `Copy to clipboard: ${mockCanister.canister_id.toText()}`
    );
  });

  it("renders copy if name present", async () => {
    const { queryByRole } = render(CanisterCard, {
      props: {
        canister: { ...mockCanister, name: "test" },
        href,
      },
    });

    const button = queryByRole("button");

    expect(button?.getAttribute("aria-label")).toEqual(
      `Copy to clipboard: ${mockCanister.canister_id.toText()}`
    );
  });
});
