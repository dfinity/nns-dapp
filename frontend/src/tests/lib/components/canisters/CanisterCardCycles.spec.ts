import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import CanisterCardCycles from "$lib/components/canisters/CanisterCardCycles.svelte";
import {
  initCyclesWorker,
  type CyclesCallback,
  type CyclesWorker,
} from "$lib/services/worker-cycles.services";
import type { CanisterSync } from "$lib/types/canister";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockCanister } from "$tests/mocks/canisters.mock";
import en from "$tests/mocks/i18n.mock";
import { render, waitFor } from "@testing-library/svelte";

let cyclesCallback: CyclesCallback | undefined;

const { terminateSpy } = vi.hoisted(() => ({ terminateSpy: vi.fn() }));

vitest.mock("$lib/services/worker-cycles.services", () => ({
  initCyclesWorker: vitest.fn(() =>
    Promise.resolve({
      startCyclesTimer: ({ callback }: { callback: CyclesCallback }) => {
        cyclesCallback = callback;
      },
      stopCyclesTimer: () => {
        // Do nothing
      },
      terminate: terminateSpy,
    })
  ),
}));

describe("CanisterCardCycles", () => {
  beforeEach(() => {
    cyclesCallback = undefined;
    terminateSpy.mockClear();
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

    await waitFor(() => expect(cyclesCallback).toBeDefined());

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

    await waitFor(() => expect(cyclesCallback).toBeDefined());

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

    await waitFor(() => expect(cyclesCallback).toBeDefined());

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

    await waitFor(() => expect(cyclesCallback).toBeDefined());

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

    await waitFor(() => expect(cyclesCallback).toBeDefined());

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

  it("should terminate the worker when destroyed to avoid leaking it", async () => {
    const { unmount } = render(CanisterCardCycles, props);

    await waitFor(() => expect(cyclesCallback).toBeDefined());

    expect(terminateSpy).not.toBeCalled();

    unmount();

    expect(terminateSpy).toBeCalledTimes(1);
  });

  it("should terminate a worker that resolves after the component is destroyed", async () => {
    // Reproduces the leak seen on the canisters list: the store is briefly
    // cleared on every visit, so a card can be destroyed while
    // `initCyclesWorker()` is still pending. The worker that arrives afterwards
    // must be terminated instead of leaked.
    let resolveWorker: (worker: CyclesWorker) => void = () => undefined;
    vi.mocked(initCyclesWorker).mockImplementationOnce(
      () =>
        new Promise<CyclesWorker>((resolve) => {
          resolveWorker = resolve;
        })
    );

    const { unmount } = render(CanisterCardCycles, props);

    // The worker init is still pending; destroy the component first.
    unmount();
    expect(terminateSpy).not.toBeCalled();

    // The worker resolves only now, after destroy.
    resolveWorker({
      startCyclesTimer: () => undefined,
      stopCyclesTimer: () => undefined,
      terminate: terminateSpy,
    });

    await waitFor(() => expect(terminateSpy).toBeCalledTimes(1));
  });
});
