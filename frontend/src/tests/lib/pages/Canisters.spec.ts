// This import needs to be at the top for the mock to work:
import MockCanisterCardCycles from "$tests/lib/pages/MockCanisterCardCycles.svelte";

import Canisters from "$lib/pages/Canisters.svelte";
import { listCanisters } from "$lib/services/canisters.services";
import { authStore } from "$lib/stores/auth.store";
import { canistersStore } from "$lib/stores/canisters.store";
import { mockPrincipal, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockCanister, mockCanisters } from "$tests/mocks/canisters.mock";
import en from "$tests/mocks/i18n.mock";
import { nnsUniverseMock } from "$tests/mocks/universe.mock";
import { UniverseSummaryPo } from "$tests/page-objects/UniverseSummary.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { Principal } from "@dfinity/principal";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import type { MockInstance } from "vitest";

vi.mock("$lib/components/canisters/CanisterCardCycles.svelte", () => ({
  default: MockCanisterCardCycles,
}));

vi.mock("$lib/services/canisters.services", () => {
  return {
    listCanisters: vi.fn(),
    getIcpToCyclesExchangeRate: vi.fn(),
  };
});

vi.mock("$lib/services/worker-cycles.services", () => ({
  initCyclesWorker: vi.fn(() =>
    Promise.resolve({
      startCyclesTimer: () => {
        // Do nothing
      },
      stopCyclesTimer: () => {
        // Do nothing
      },
    })
  ),
}));

describe("Canisters", () => {
  let authStoreMock: MockInstance;

  beforeEach(() => {
    authStoreMock = vi.spyOn(authStore, "subscribe");
    resetIdentity();

    canistersStore.setCanisters({
      canisters: mockCanisters,
      certified: true,
    });
  });

  it("should render ic", () => {
    const { getByText } = render(Canisters);

    expect(getByText(en.core.ic)).toBeInTheDocument();
  });

  it("should render the IC summary", async () => {
    const { container } = render(Canisters);
    const po = UniverseSummaryPo.under(new JestPageObjectElement(container));

    expect(await po.getLogoUrl()).toBe(nnsUniverseMock.logo);
    expect(await po.getTitle()).toBe(nnsUniverseMock.title);
  });

  it("should subscribe to store", () => {
    expect(authStoreMock).not.toHaveBeenCalled();
    render(Canisters);
    expect(authStoreMock).toHaveBeenCalled();
  });

  it("should load canisters", () => {
    expect(listCanisters).not.toHaveBeenCalled();
    render(Canisters);
    expect(listCanisters).toHaveBeenCalled();
  });

  it("should render a principal as text", () => {
    const { getByText } = render(Canisters);

    expect(
      getByText(mockPrincipal.toText(), { exact: false })
    ).toBeInTheDocument();
  });

  it("should render canister cards for canisters", () => {
    const { queryAllByTestId } = render(Canisters);

    expect(queryAllByTestId("canister-card").length).toBe(2);
  });

  it("should open the LinkCanisterModal on click to Link Canister", async () => {
    const { queryByTestId } = render(Canisters);

    const toolbarButton = queryByTestId("link-canister-button");
    expect(toolbarButton).not.toBeNull();

    toolbarButton !== null && (await fireEvent.click(toolbarButton));

    await waitFor(() =>
      expect(queryByTestId("link-canister-modal-title")).toBeInTheDocument()
    );
  });

  it("should open the CreateCanisterModal on click to Create Canister", async () => {
    const { queryByTestId } = render(Canisters);

    const toolbarButton = queryByTestId("create-canister-button");
    expect(toolbarButton).not.toBeNull();

    toolbarButton !== null && (await fireEvent.click(toolbarButton));

    await waitFor(() =>
      expect(queryByTestId("create-canister-modal-title")).toBeInTheDocument()
    );
  });

  it("should not recreate cards when store is repopulated with same canisters", async () => {
    const mockCanisterCopy = {
      ...mockCanister,
      // Make sure we have a different instance of the same Principal.
      // This forces the component to use `.toText()` on the principal to use it
      // as a key to prevent rerendering when the list changes.
      canister_id: Principal.fromText(mockCanister.canister_id.toText()),
    };
    canistersStore.setCanisters({
      canisters: [mockCanister],
      certified: false,
    });
    const { getByTestId } = render(Canisters);
    await runResolvedPromises();

    const cardsCreatedCount = getByTestId(
      "mock-canister-card-instance-count"
    ).textContent;

    canistersStore.setCanisters({
      canisters: [mockCanisterCopy],
      certified: true,
    });
    await runResolvedPromises();

    // No additional cards should have been created.
    expect(getByTestId("mock-canister-card-instance-count").textContent).toBe(
      cardsCreatedCount
    );
  });
});
