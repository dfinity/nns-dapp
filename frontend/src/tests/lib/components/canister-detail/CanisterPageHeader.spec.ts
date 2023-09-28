/**
 * @jest-environment jsdom
 */

import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
import CanisterPageHeader from "$lib/components/canister-detail/CanisterPageHeader.svelte";
import { mockCanister } from "$tests/mocks/canisters.mock";
import { CanisterHeaderPo } from "$tests/page-objects/CanisterHeader.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Principal } from "@dfinity/principal";
import { render } from "@testing-library/svelte";

describe("CanisterHeadingTitle", () => {
  const renderComponent = (canister: CanisterInfo) => {
    const { container } = render(CanisterPageHeader, {
      props: { canister },
    });

    return CanisterHeaderPo.under(new JestPageObjectElement(container));
  };

  it("renders Internet Computer universe", async () => {
    const po = renderComponent(mockCanister);
    expect(await po.getUniverseText()).toBe("Internet Computer");
  });

  it("renders canister id", async () => {
    const canister = {
      ...mockCanister,
      canister_id: Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
    };
    const po = renderComponent(canister);
    expect(await po.getCanisterIdText()).toBe("ryjl3-t...aba-cai");
  });
});
