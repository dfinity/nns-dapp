/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import CanisterCard from "../../../../lib/components/canisters/CanisterCard.svelte";
import { mockCanister } from "../../../mocks/canisters.mock";

describe("CanisterCard", () => {
  it("renders a Card", () => {
    const { queryByTestId } = render(CanisterCard, {
      props: { canister: mockCanister },
    });

    const element = queryByTestId("canister-card");
    expect(element).toBeInTheDocument();
  });

  it("is clickable", async () => {
    const spyClick = jest.fn();
    const { container, component } = render(CanisterCard, {
      props: { canister: mockCanister },
    });
    component.$on("click", spyClick);

    const articleElement = container.querySelector("article");

    articleElement && (await fireEvent.click(articleElement));

    expect(spyClick).toBeCalled();
  });

  it("renders role and aria-label passed", async () => {
    const role = "link";
    const ariaLabel = "test label";
    const { container } = render(CanisterCard, {
      props: {
        canister: mockCanister,
        role,
        ariaLabel,
      },
    });

    const articleElement = container.querySelector("article");

    expect(articleElement?.getAttribute("role")).toBe(role);
    expect(articleElement?.getAttribute("aria-label")).toBe(ariaLabel);
  });

  it("renders the canister id", async () => {
    const { queryAllByText } = render(CanisterCard, {
      props: {
        canister: mockCanister,
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
      },
    });

    const button = queryByRole("button");

    expect(button?.getAttribute("aria-label")).toEqual(
      `Copy "${mockCanister.canister_id.toText()}" to clipboard`
    );
  });

  it("renders copy if name present", async () => {
    const { queryByRole } = render(CanisterCard, {
      props: {
        canister: { ...mockCanister, name: "test" },
      },
    });

    const button = queryByRole("button");

    expect(button?.getAttribute("aria-label")).toEqual(
      `Copy "${mockCanister.canister_id.toText()}" to clipboard`
    );
  });
});
