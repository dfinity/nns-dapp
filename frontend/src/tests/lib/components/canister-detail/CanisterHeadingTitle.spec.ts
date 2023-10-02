/**
 * @jest-environment jsdom
 */

import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
import CanisterHeadingTitle from "$lib/components/canister-detail/CanisterHeadingTitle.svelte";
import { mockCanister, mockCanisterDetails } from "$tests/mocks/canisters.mock";
import { CanisterHeadingTitlePo } from "$tests/page-objects/CanisterHeadingTitle.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Principal } from "@dfinity/principal";
import { render } from "@testing-library/svelte";

describe("CanisterHeadingTitle", () => {
  const renderComponent = (
    details: CanisterDetails | undefined,
    isController: boolean | undefined,
    canister: CanisterInfo = mockCanister
  ) => {
    const { container } = render(CanisterHeadingTitle, {
      props: { details, isController, canister },
    });

    return CanisterHeadingTitlePo.under(new JestPageObjectElement(container));
  };

  it("renders skeleton if controller is undefined", async () => {
    const po = renderComponent(undefined, undefined);
    expect(await po.hasSkeleton()).toBe(true);
  });

  // This is an edge case because the we know whether the user is the controller when we load the canister details.
  it("renders skeleton if controller is true but canister details are not yet loaded", async () => {
    const po = renderComponent(undefined, true);
    expect(await po.hasSkeleton()).toBe(true);
  });

  it("renders canister name if user is not the controller and name is present", async () => {
    const canisterName = "My Canister";
    const canister = {
      ...mockCanister,
      name: canisterName,
    };
    const po = renderComponent(undefined, false, canister);
    expect(await po.getTitle()).toBe(canisterName);
  });

  it("renders canister id if user is not the controller and name is not present", async () => {
    const canister = {
      ...mockCanister,
      name: "",
      canister_id: Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
    };
    const po = renderComponent(undefined, false, canister);
    expect(await po.getTitle()).toBe("ryjl3-t...aba-cai");
  });

  it("renders cycles balance if defined", async () => {
    const canisterDetails = {
      ...mockCanisterDetails,
      cycles: 314000000n,
    };
    const po1 = renderComponent(canisterDetails, true);
    expect(await po1.getTitle()).toBe("3.14 T Cycles");

    const po2 = renderComponent(canisterDetails, false);
    expect(await po2.getTitle()).toBe("3.14 T Cycles");

    const po3 = renderComponent(canisterDetails, undefined);
    expect(await po3.getTitle()).toBe("3.14 T Cycles");
  });
});
