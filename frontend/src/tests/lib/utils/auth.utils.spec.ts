import { isSignedIn } from "../../../lib/utils/auth.utils";
import { mockIdentity } from "../../mocks/auth.store.mock";

describe("auth-utils", () => {
  it("should not be signed in", () => {
    expect(isSignedIn(undefined)).toBeFalsy();
    expect(isSignedIn(null)).toBeFalsy();
  });

  it("should be signed in", () => {
    expect(isSignedIn(mockIdentity)).toBeTruthy();
  });
});
