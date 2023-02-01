import { isSignedInStore } from "$lib/derived/is-signed-in.derived";
import { authStore, type AuthStore } from "$lib/stores/auth.store";
import { get, type Subscriber } from "svelte/store";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";

describe("is-signed-in derived store", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return true if identity is in store", async () => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
    const isLoggedIn = get(isSignedInStore);
    expect(isLoggedIn).toBeTruthy();
  });

  it("should return true if identity is in store", async () => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation((run: Subscriber<AuthStore>): (() => void) => {
        run({ identity: undefined });

        return () => undefined;
      });
    const isLoggedIn = get(isSignedInStore);
    expect(isLoggedIn).toBeFalsy();
  });
});
