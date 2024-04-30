import { initAppPrivateDataProxy } from "$lib/proxy/app.services.proxy";
import * as actionableProposalsServices from "$lib/services/actionable-proposals.services";
import * as actionableSnsProposalsServices from "$lib/services/actionable-sns-proposals.services";
import { initAuthWorker } from "$lib/services/worker-auth.services";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import App from "$routes/+layout.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
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

    actionableNnsProposalsStore.reset();

    setNoIdentity();
  });

  it("should init the app after sign in", async () => {
    expect(initAppPrivateDataProxy).not.toHaveBeenCalled();

    render(App);

    resetIdentity();
    await runResolvedPromises();

    expect(initAppPrivateDataProxy).toHaveBeenCalled();
  });

  it("should register auth worker sync after sign in", async () => {
    expect(initAuthWorker).not.toHaveBeenCalled();

    render(App);

    resetIdentity();
    await runResolvedPromises();

    expect(initAuthWorker).toHaveBeenCalled();
  });

  it("should reset toasts on sign in", async () => {
    const spy = vi.spyOn(toastsStore, "reset");
    expect(spy).not.toBeCalled();

    render(App);

    resetIdentity();
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

    it("should call loadActionableProposals on startup", async () => {
      expect(spyLoadActionableProposals).toHaveBeenCalledTimes(0);
      resetIdentity();
      render(App);
      await runResolvedPromises();
      expect(spyLoadActionableProposals).toHaveBeenCalledTimes(1);
    });

    it("should call loadActionableProposals after sign-in", async () => {
      expect(spyLoadActionableProposals).toHaveBeenCalledTimes(0);
      render(App);
      await runResolvedPromises();
      expect(spyLoadActionableProposals).toHaveBeenCalledTimes(0);
      resetIdentity();
      await runResolvedPromises();
      expect(spyLoadActionableProposals).toHaveBeenCalledTimes(1);
    });

    it("should call loadActionableSnsProposals on startup", async () => {
      expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);
      resetIdentity();
      setSnsProjects([{ lifecycle: SnsSwapLifecycle.Committed }]);
      render(App);
      await runResolvedPromises();
      expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(1);
    });

    it("should call loadActionableSnsProposals after sign-in and sns availability", async () => {
      expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);
      render(App);
      await runResolvedPromises();
      expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);
      resetIdentity();
      await runResolvedPromises();
      expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);
      setSnsProjects([{ lifecycle: SnsSwapLifecycle.Committed }]);
      await runResolvedPromises();
      expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(1);
    });
  });
});
