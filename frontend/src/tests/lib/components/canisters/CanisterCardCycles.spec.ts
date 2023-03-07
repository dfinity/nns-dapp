/**
 * @jest-environment jsdom
 */

import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import CanisterCardCycles from "$lib/components/canisters/CanisterCardCycles.svelte";
import type { CyclesCallback } from "$lib/services/worker-cycles.services";
import type { CanisterSync } from "$lib/types/canister";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockCanister } from "$tests/mocks/canisters.mock";
import en from "$tests/mocks/i18n.mock";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";

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
  afterAll(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  const props = { props: { canister: mockCanister } };

  const mock: CanisterSync = {
    id: mockCanister.canister_id.toText(),
    sync: "synced",
    data: {
      cycles: 246913400000000n,
      memorySize: 1287500n,
      status: 2,
    } as CanisterDetails,
  };

  it("should render canister cycles information", async () => {
    const { getByTestId } = render(CanisterCardCycles, props);

    await tick();

    cyclesCallback?.({
      canister: mock,
    });

    await waitFor(() =>
      expect(getByTestId("canister-cycles")?.textContent).toEqual(
        "246.913 T Cycles"
      )
    );
    expect(getByTestId("canister-status")?.textContent).toEqual(
      en.canister_detail.status_running
    );
    expect(getByTestId("canister-memory")?.textContent).toEqual("1.29 MB");
  });

  it("should render a hint if canister cycles are zero", async () => {
    const { getByTestId } = render(CanisterCardCycles, props);

    await tick();

    cyclesCallback?.({
      canister: {
        ...mock,
        cyclesStatus: "empty",
        data: {
          ...mock.data,
          cycles: 0n,
        },
      },
    });

    await waitFor(() => {
      const cycles = getByTestId("canister-cycles");

      expect(cycles?.textContent).toEqual("0.000 T Cycles");
      expect(cycles?.classList.contains("empty")).toBeTruthy();
    });
  });

  it("should not render canister cycles information if different canister", async () => {
    const { getByTestId } = render(CanisterCardCycles, props);

    await tick();

    cyclesCallback?.({
      canister: {
        ...mock,
        id: mockPrincipal.toText(),
      },
    });

    expect(() => getByTestId("canister-cycles")).toThrow();
  });

  it("should not render any information if canister cycles sync on error", async () => {
    const { container } = render(CanisterCardCycles, props);

    await tick();

    cyclesCallback?.({
      canister: {
        ...mock,
        sync: "error",
      },
    });

    await waitFor(() =>
      expect(container.querySelectorAll("p").length).toEqual(0)
    );
  });

  it("should render skeleton while syncing", async () => {
    const { getAllByTestId } = render(CanisterCardCycles, props);

    await tick();

    cyclesCallback?.({
      canister: {
        ...mock,
        sync: "syncing",
      },
    });

    await waitFor(() =>
      expect(getAllByTestId("skeleton-text").length).toEqual(3)
    );
  });

  it("should render skeleton while initializing", async () => {
    const { getAllByTestId } = render(CanisterCardCycles, props);

    await waitFor(() =>
      expect(getAllByTestId("skeleton-text").length).toEqual(3)
    );
  });
});
