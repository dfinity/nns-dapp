import { initAppPrivateDataProxy } from "$lib/proxy/app.services.proxy";
import { initAuthWorker } from "$lib/services/worker-auth.services";
import { authStore } from "$lib/stores/auth.store";
import App from "$routes/+layout.svelte";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { toastsStore } from "@dfinity/gix-components";
import { render, waitFor } from "@testing-library/svelte";

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
  beforeAll(() => {
    vi.spyOn(authStore, "subscribe").mockImplementation(
      mutableMockAuthStoreSubscribe
    );

    vi.spyOn(authStore, "sync").mockImplementation(() => Promise.resolve());
  });

  afterAll(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("should init the app after sign in", async () => {
    render(App);

    authStoreMock.next({
      identity: mockIdentity,
    });

    await waitFor(() => expect(initAppPrivateDataProxy).toHaveBeenCalled());
  });

  it("should register auth worker sync after sign in", () => {
    render(App);

    authStoreMock.next({
      identity: mockIdentity,
    });

    expect(initAuthWorker).toHaveBeenCalled();
  });

  it("should reset toasts on sign in", () => {
    const spy = vi.spyOn(toastsStore, "reset");

    render(App);

    authStoreMock.next({
      identity: mockIdentity,
    });

    expect(spy).toBeCalled();
  });
});
