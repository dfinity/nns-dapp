/**
 * @jest-environment jsdom
 */

import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import CanisterHeadingTitle from "$lib/components/canister-detail/CanisterHeadingTitle.svelte";
import { mockCanisterDetails } from "$tests/mocks/canisters.mock";
import { CanisterHeadingTitlePo } from "$tests/page-objects/CanisterHeadingTitle.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("CanisterHeadingTitle", () => {
  const renderComponent = (
    details: CanisterDetails | undefined,
    isController: boolean | undefined
  ) => {
    const { container } = render(CanisterHeadingTitle, {
      props: { details, isController },
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

  it("renders unavailable balance if user is not the controller", async () => {
    const po = renderComponent(undefined, false);
    expect(await po.getTitle()).toBe("Balance unavailable");
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
