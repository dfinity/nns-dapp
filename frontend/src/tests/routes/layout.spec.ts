import { initAppPrivateDataProxy } from "$lib/proxy/app.services.proxy";
import * as analytics from "$lib/services/analytics.services";
import { initAuthWorker } from "$lib/services/worker-auth.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import App from "$routes/+layout.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { HighlightPo } from "$tests/page-objects/Highlight.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
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
  });

  it("should not show the Highlight component by default", async () => {
    const { container } = render(App);

    const po = HighlightPo.under(new JestPageObjectElement(container));

    expect(await po.isPresent()).toBe(false);
  });

  it("should show the Highlight component if the user is signed in and the feature is on", async () => {
    const renderComponent = () => {
      const { container } = render(App);
      return HighlightPo.under(new JestPageObjectElement(container));
    };

    setNoIdentity();
    expect(await renderComponent().isPresent()).toBe(false);

    resetIdentity();
    overrideFeatureFlagsStore.setFlag("ENABLE_SNS_TOPICS", true);
    expect(await renderComponent().isPresent()).toBe(true);
  });
});
