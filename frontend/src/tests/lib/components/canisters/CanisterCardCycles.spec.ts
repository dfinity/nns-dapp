/**
 * @jest-environment jsdom
 */

import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import CanisterCardCycles from "$lib/components/canisters/CanisterCardCycles.svelte";
import type { CyclesCallback } from "$lib/services/worker-cycles.services";
import type { CanisterSync } from "$lib/types/canister";
import { render, waitFor } from "@testing-library/svelte";
import { mockCanister } from "../../../mocks/canisters.mock";
import en from "../../../mocks/i18n.mock";

let cyclesCallback: CyclesCallback | undefined;

jest.mock("$lib/services/worker-cycles.services", () => ({
  initCyclesWorker: jest.fn(() =>
    Promise.resolve({
      startCyclesTimer: ({ callback }: { callback: CyclesCallback }) => {
        cyclesCallback = callback;
      },
      stopCyclesTimer: () => {
        // Do nothing
      },
    })
  ),
}));

describe("CanisterCardCycles", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  const props = { props: { canister: mockCanister } };

  it("should render canister cycles information", async () => {
    const { getByTestId } = render(CanisterCardCycles, props);

    // Wait for initialization of the callback
    await waitFor(() => expect(cyclesCallback).not.toBeUndefined());

    const mock: CanisterSync = {
      id: mockCanister.canister_id.toText(),
      sync: "synced",
      data: {
        cycles: 246913400000000n,
        memorySize: 1287500n,
        status: 2,
      } as CanisterDetails,
    };

    cyclesCallback?.({
      canister: mock,
    });

    await waitFor(() =>
      expect(getByTestId("canister-cycles")?.textContent).toEqual(
        "246.913 TCycles"
      )
    );
    expect(getByTestId("canister-status")?.textContent).toEqual(
      en.canister_detail.status_running
    );
    expect(getByTestId("canister-memory")?.textContent).toEqual("1.29mb");
  });

  // TODO: should not render if not same canister id
  // TODO: should render skeleton on load and syncing
  // TODO: should not render if error
});
