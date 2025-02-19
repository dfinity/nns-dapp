import { initAppPrivateDataProxy } from "$lib/proxy/app.services.proxy";
import * as analytics from "$lib/services/analytics.services";
import { initAuthWorker } from "$lib/services/worker-auth.services";
import App from "$routes/+layout.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { render } from "@testing-library/svelte";

const mockCleanupFn1 = vi.fn();
const mockCleanupFn2 = vi.fn();

vi.mock("plausible-tracker", () => ({
  default: () => ({
    enableAutoPageviews: () => mockCleanupFn1,
    enableAutoOutboundTracking: () => mockCleanupFn2,
  }),
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
    const initAnalyticsSpy = vi.spyOn(analytics, "initAnalytics");

    expect(initAnalyticsSpy).not.toHaveBeenCalled();

    render(App);

    expect(initAnalyticsSpy).toHaveBeenCalledTimes(1);

    resetIdentity();
    await runResolvedPromises();

    expect(initAnalyticsSpy).toHaveBeenCalledTimes(1);
    expect(mockCleanupFn1).not.toHaveBeenCalled();
    expect(mockCleanupFn2).not.toHaveBeenCalled();
  });

  it("should call cleanup functions on unmount", async () => {
    const { unmount } = render(App);

    expect(mockCleanupFn1).not.toHaveBeenCalled();
    expect(mockCleanupFn2).not.toHaveBeenCalled();

    unmount();

    expect(mockCleanupFn1).toHaveBeenCalledTimes(1);
    expect(mockCleanupFn2).toHaveBeenCalledTimes(1);
  });
});
