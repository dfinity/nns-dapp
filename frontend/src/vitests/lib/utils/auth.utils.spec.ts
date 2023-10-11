import { isSignedIn, loadIdentity } from "$lib/utils/auth.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { AuthClient } from "@dfinity/auth-client";
import { mock } from "vitest-mock-extended";

describe("auth-utils", () => {
  describe("isSignedIn", () => {
    it("should not be signed in", () => {
      expect(isSignedIn(undefined)).toBe(false);
      expect(isSignedIn(null)).toBe(false);
    });

    it("should be signed in", () => {
      expect(isSignedIn(mockIdentity)).toBeTruthy();
    });
  });

  describe("loadIdentity", () => {
    describe("without identity", () => {
      const mockAuthClient = mock<AuthClient>();
      mockAuthClient.isAuthenticated.mockResolvedValue(false);

      beforeEach(() =>
        vi
          .spyOn(AuthClient, "create")
          .mockImplementation(async (): Promise<AuthClient> => mockAuthClient)
      );

      it("should return undefined if not authenticated", async () => {
        expect(await loadIdentity()).toBeUndefined();
      });
    });

    describe("with identity", () => {
      const mockAuthClient = mock<AuthClient>();
      mockAuthClient.isAuthenticated.mockResolvedValue(true);
      mockAuthClient.getIdentity.mockResolvedValue(mockIdentity as never);

      beforeEach(() =>
        vi
          .spyOn(AuthClient, "create")
          .mockImplementation(async (): Promise<AuthClient> => mockAuthClient)
      );

      it("should return identity if authenticated", async () => {
        expect(await loadIdentity()).toEqual(mockIdentity);
      });
    });
  });
});
