/**
 * @jest-environment jsdom
 */

import CanisterCardTitle from "$lib/components/canisters/CanisterCardTitle.svelte";
import { render } from "@testing-library/svelte";
import { mockCanister } from "../../../mocks/canisters.mock";

describe("CanisterCardTitle", () => {
  it("renders the canister name if present", async () => {
    const canisterName = "Da best Canister";
    const { getByText } = render(CanisterCardTitle, {
      props: {
        canister: { ...mockCanister, name: canisterName },
      },
    });
    expect(getByText(canisterName)).toBeInTheDocument();
  });

  it("renders the canister id in text if name is empty string", async () => {
    const { queryAllByText } = render(CanisterCardTitle, {
      props: {
        canister: { ...mockCanister, name: "" },
      },
    });
    expect(
      queryAllByText(mockCanister.canister_id.toText()).length
    ).toBeGreaterThan(0);
  });

  it("renders the canister id", async () => {
    const { queryAllByText } = render(CanisterCardTitle, {
      props: {
        canister: mockCanister,
      },
    });
    expect(
      queryAllByText(mockCanister.canister_id.toText()).length
    ).toBeGreaterThan(0);
  });

  it("renders title as h4 per default", async () => {
    const { container } = render(CanisterCardTitle, {
      props: {
        canister: mockCanister,
      },
    });
    expect(container.querySelector("h3")).not.toBeNull();
  });

  it("renders title as h1", async () => {
    const { container } = render(CanisterCardTitle, {
      props: {
        canister: mockCanister,
        titleTag: "h1",
      },
    });
    expect(container.querySelector("h1")).not.toBeNull();
  });
});
