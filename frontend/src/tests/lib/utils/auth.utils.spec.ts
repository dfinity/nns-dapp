import { isSignedIn } from "$lib/utils/auth.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";

describe("auth-utils", () => {
  it("should not be signed in", () => {
    expect(isSignedIn(undefined)).toBe(false);
    expect(isSignedIn(null)).toBe(false);
  });

  it("should be signed in", () => {
    expect(isSignedIn(mockIdentity)).toBeTruthy();
  });
});
