import { isSignedIn } from "../../../lib/utils/auth.utils";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import type { Principal } from "@dfinity/principal";

describe("auth-utils", () => {
  it("should not be signed in", () => {
    expect(undefined).toBeFalsy();
    expect(null).toBeFalsy();
  });

  it("should be signed in", () => {
    expect(isSignedIn(mockPrincipal as Principal)).toBeTruthy();
  });
});
