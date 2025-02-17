import { initAppPrivateDataProxy } from "$lib/proxy/app.services.proxy";
import {
  enableAutoOutboundTracking,
  enableAutoPageviews,
} from "$lib/services/analytics";
import { initAuthWorker } from "$lib/services/worker-auth.services";
import App from "$routes/+layout.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { render } from "@testing-library/svelte";

vi.mock("$lib/services/analytics", () => ({
  enableAutoPageviews: vi.fn(),
  enableAutoOutboundTracking: vi.fn(),
}));

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

  it("should initialize analytics tracking on mount", async () => {
    render(App);

    expect(enableAutoPageviews).toHaveBeenCalled();
    expect(enableAutoOutboundTracking).toHaveBeenCalled();

    resetIdentity();
    await runResolvedPromises();

    expect(enableAutoPageviews).toHaveBeenCalledTimes(1);
    expect(enableAutoOutboundTracking).toHaveBeenCalledTimes(1);
  });
});
