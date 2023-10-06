
import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
import CanisterPageHeading from "$lib/components/canister-detail/CanisterPageHeading.svelte";
import { mockCanister, mockCanisterDetails } from "$tests/mocks/canisters.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { CanisterPageHeadingPo } from "$tests/page-objects/CanisterPageHeading.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("CanisterHeadingTitle", () => {
  const canisterId = principal(0);
  const eventListener = vitest.fn();

  const renderComponent = (
    canister: CanisterInfo,
    canisterDetails: CanisterDetails | undefined,
    isController: boolean | undefined
  ) => {
    const { container } = render(CanisterPageHeading, {
      props: { canisterDetails, isController, canister },
    });

    return CanisterPageHeadingPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vitest.clearAllMocks();
    window.removeEventListener("nnsCanisterDetailModal", eventListener);
  });

  it("renders the canister page title", async () => {
    const po = renderComponent(mockCanister, undefined, undefined);
    expect(await po.hasTitle()).toBe(true);
  });

  it("renders the cycles as title when present", async () => {
    const canisterDetails = {
      ...mockCanisterDetails,
      cycles: 314000000n,
    };
    const po = renderComponent(mockCanister, canisterDetails, undefined);
    expect(await po.getTitle()).toBe("3.14 T Cycles");
  });

  it("renders the canister name as subtitle if present and user is the controller", async () => {
    const name = "My Canister";
    const canisterInfo = {
      ...mockCanister,
      name,
    };
    const po = renderComponent(canisterInfo, undefined, true);
    expect(await po.getSubtitle()).toBe(name);
  });

  it("renders the canister name in title and no subtitle if user is not the controller", async () => {
    const name = "My Canister";
    const canisterInfo = {
      ...mockCanister,
      name,
    };
    const po = renderComponent(canisterInfo, undefined, false);
    expect(await po.getTitle()).toBe(name);
    expect(await po.hasSubtitle()).toBe(false);
  });

  it("dispatches unlink canister modal event when unlink button is clicked", async () => {
    const canisterInfo = {
      ...mockCanister,
      canister_id: canisterId,
    };
    window.addEventListener("nnsCanisterDetailModal", eventListener);
    expect(eventListener).not.toHaveBeenCalled();

    const po = renderComponent(canisterInfo, undefined, undefined);
    await po.clickUnlink();
    expect(eventListener).toHaveBeenCalledTimes(1);
    const $event = new CustomEvent("nnsCanisterDetailModal", {
      detail: { type: "unlink", canisterId },
      bubbles: true,
    });
    expect(eventListener).toHaveBeenCalledWith($event);
  });

  it("dispatches rename canister modal event when rename button is clicked", async () => {
    const canisterInfo = {
      ...mockCanister,
      canister_id: canisterId,
    };
    window.addEventListener("nnsCanisterDetailModal", eventListener);
    expect(eventListener).not.toHaveBeenCalled();

    const po = renderComponent(canisterInfo, undefined, undefined);
    await po.clickRename();
    expect(eventListener).toHaveBeenCalledTimes(1);
    const $event = new CustomEvent("nnsCanisterDetailModal", {
      detail: { type: "rename" },
      bubbles: true,
    });
    expect(eventListener).toHaveBeenCalledWith($event);
  });
});
