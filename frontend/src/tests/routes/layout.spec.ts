import { initAppPrivateDataProxy } from "$lib/proxy/app.services.proxy";
import * as actionableProposalsServices from "$lib/services/actionable-proposals.services";
import * as actionableSnsProposalsServices from "$lib/services/actionable-sns-proposals.services";
import { initAuthWorker } from "$lib/services/worker-auth.services";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { authStore } from "$lib/stores/auth.store";
import App from "$routes/+layout.svelte";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

vi.mock("$lib/services/worker-auth.services", () => ({
  initAuthWorker: vi.fn(() =>
    Promise.resolve({
      syncAuthIdle: () => {
        // Do nothing
      },
    })
  ),
}));

vi.mock("$lib/services/app.services", () => ({
  initApp: vi.fn(() => Promise.resolve()),
}));

vi.mock("$lib/proxy/app.services.proxy");

describe("Layout", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(authStore, "subscribe").mockImplementation(
      mutableMockAuthStoreSubscribe
    );

    vi.spyOn(authStore, "sync").mockImplementation(() => Promise.resolve());
    actionableNnsProposalsStore.reset();
  });

  it("should init the app after sign in", async () => {
    expect(initAppPrivateDataProxy).not.toHaveBeenCalled();

    render(App);

    authStoreMock.next({
      identity: mockIdentity,
    });
    await runResolvedPromises();

    expect(initAppPrivateDataProxy).toHaveBeenCalled();
  });

  it("should register auth worker sync after sign in", async () => {
    expect(initAuthWorker).not.toHaveBeenCalled();

    render(App);

    authStoreMock.next({
      identity: mockIdentity,
    });
    await runResolvedPromises();

    expect(initAuthWorker).toHaveBeenCalled();
  });

  it("should reset toasts on sign in", async () => {
    const spy = vi.spyOn(toastsStore, "reset");
    expect(spy).not.toBeCalled();

    render(App);

    authStoreMock.next({
      identity: mockIdentity,
    });
    await runResolvedPromises();

    expect(spy).toBeCalled();
  });

  describe("loadActionableProposals", () => {
    let spyLoadActionableProposals;
    let spyLoadActionableSnsProposals;

    beforeEach(() => {
      resetSnsProjects();
      spyLoadActionableProposals = vi
        .spyOn(actionableProposalsServices, "loadActionableProposals")
        .mockResolvedValue();
      spyLoadActionableSnsProposals = vi
        .spyOn(actionableSnsProposalsServices, "loadActionableSnsProposals")
        .mockResolvedValue();
    });

    it("should call loadActionableProposals", async () => {
      authStoreMock.next({
        identity: mockIdentity,
      });
      expect(spyLoadActionableProposals).toHaveBeenCalledTimes(0);
      render(App);
      expect(spyLoadActionableProposals).toHaveBeenCalledTimes(1);
    });

    it("should not call loadActionableProposals when not signedIn", async () => {
      authStoreMock.next({
        identity: undefined,
      });
      expect(spyLoadActionableProposals).toHaveBeenCalledTimes(0);
      render(App);
      expect(spyLoadActionableProposals).toHaveBeenCalledTimes(0);
    });

    it("should call loadActionableSnsProposals", async () => {
      authStoreMock.next({
        identity: mockIdentity,
      });
      setSnsProjects([{ lifecycle: SnsSwapLifecycle.Committed }]);
      expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);
      render(App);
      expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(1);
    });

    it("should not call loadActionableSnsProposals when not signedIn", async () => {
      authStoreMock.next({
        identity: undefined,
      });
      setSnsProjects([{ lifecycle: SnsSwapLifecycle.Committed }]);
      expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);
      render(App);
      expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);
    });

    it("should not call loadActionableSnsProposals when no committed Sns available", async () => {
      authStoreMock.next({
        identity: mockIdentity,
      });
      expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);
      render(App);
      expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);
    });
  });
});
