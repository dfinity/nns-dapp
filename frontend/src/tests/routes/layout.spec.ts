import { initAppPrivateDataProxy } from "$lib/proxy/app.services.proxy";
import { initAuthWorker } from "$lib/services/worker-auth.services";
import { authStore } from "$lib/stores/auth.store";
import App from "$routes/+layout.svelte";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
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
    vi.restoreAllMocks();

    vi.spyOn(authStore, "subscribe").mockImplementation(
      mutableMockAuthStoreSubscribe
    );

    vi.spyOn(authStore, "sync").mockImplementation(() => Promise.resolve());
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
});
