import { isLoggedInStore } from "$lib/derived/is-logged-in.derived";
import { authStore, type AuthStore } from "$lib/stores/auth.store";
import { get, type Subscriber } from "svelte/store";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";

describe("is-logged-in derived store", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return true if identity is in store", async () => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
    const isLoggedIn = get(isLoggedInStore);
    expect(isLoggedIn).toBeTruthy();
  });

  it("should return true if identity is in store", async () => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation((run: Subscriber<AuthStore>): (() => void) => {
        run({ identity: undefined });

        return () => undefined;
      });
    const isLoggedIn = get(isLoggedInStore);
    expect(isLoggedIn).toBeFalsy();
  });
});
