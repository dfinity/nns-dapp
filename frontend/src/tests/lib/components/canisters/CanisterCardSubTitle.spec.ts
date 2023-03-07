/**
 * @jest-environment jsdom
 */

import CanisterCardSubTitle from "$lib/components/canisters/CanisterCardSubTitle.svelte";
import { mockCanister } from "$tests/mocks/canisters.mock";
import { render } from "@testing-library/svelte";

describe("CanisterCardSubTitle", () => {
  it("renders the canister id", async () => {
    const { queryAllByText } = render(CanisterCardSubTitle, {
      props: {
        canister: { ...mockCanister, name: "test" },
      },
    });
    expect(
      queryAllByText(mockCanister.canister_id.toText()).length
    ).toBeGreaterThan(0);
  });

  it("do not render the canister id if name not present", async () => {
    const { queryAllByText } = render(CanisterCardSubTitle, {
      props: {
        canister: mockCanister,
      },
    });
    expect(queryAllByText(mockCanister.canister_id.toText()).length).toEqual(0);
  });

  it("renders copy if name present", async () => {
    const { queryByRole } = render(CanisterCardSubTitle, {
      props: {
        canister: { ...mockCanister, name: "test" },
      },
    });

    const button = queryByRole("button");

    expect(button?.getAttribute("aria-label")).toEqual(
      `Copy to clipboard: ${mockCanister.canister_id.toText()}`
    );
  });
});
