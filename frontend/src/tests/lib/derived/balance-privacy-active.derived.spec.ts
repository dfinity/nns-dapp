import { isPrivacyModeStore } from "$lib/derived/balance-privacy-active.derived";
import { authStore } from "$lib/stores/auth.store";
import { balancePrivacyOptionStore } from "$lib/stores/balance-privacy-option.store";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { get } from "svelte/store";

describe("balance-privacy-active.derived", () => {
  beforeEach(() => {
    balancePrivacyOptionStore.set("show");
  });

  it("should be false by default", () => {
    const value = get(isPrivacyModeStore);
    expect(value).toBe(false);
  });

  it("should be false when user is not signed in and privacy mode is 'hide'", () => {
    balancePrivacyOptionStore.set("hide");
    authStore.setForTesting(null);

    const value = get(isPrivacyModeStore);
    expect(value).toBe(false);
  });

  it("should be false when user is signed in but privacy mode is 'show'", () => {
    authStore.setForTesting(mockIdentity);
    balancePrivacyOptionStore.set("show");

    const value = get(isPrivacyModeStore);
    expect(value).toBe(false);
  });

  it("should be true when user is signed in and privacy mode is 'hide'", () => {
    authStore.setForTesting(mockIdentity);
    balancePrivacyOptionStore.set("hide");

    const value = get(isPrivacyModeStore);
    expect(value).toBe(true);
  });
});
