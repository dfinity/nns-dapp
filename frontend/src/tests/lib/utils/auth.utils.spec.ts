import {
  getIdentityProviderUrl,
  isSignedIn,
  loadIdentity,
} from "$lib/utils/auth.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { AuthClient } from "@dfinity/auth-client";
import { mock } from "vitest-mock-extended";

describe("auth-utils", () => {
  const { host: originalWindowLocationHost } = window.location;

  beforeEach(() => {
    // restore original host
    window.location.host = originalWindowLocationHost;

    vi.restoreAllMocks();
  });

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

      beforeEach(() => {
        vi.spyOn(AuthClient, "create").mockImplementation(
          async (): Promise<AuthClient> => mockAuthClient
        );
      });

      it("should return undefined if not authenticated", async () => {
        expect(await loadIdentity()).toBeUndefined();
      });
    });

    describe("with identity", () => {
      const mockAuthClient = mock<AuthClient>();

      beforeEach(() => {
        mockAuthClient.isAuthenticated.mockResolvedValue(true);
        mockAuthClient.getIdentity.mockResolvedValue(mockIdentity as never);

        vi.spyOn(AuthClient, "create").mockImplementation(
          async (): Promise<AuthClient> => mockAuthClient
        );
      });

      it("should return identity if authenticated", async () => {
        expect(await loadIdentity()).toEqual(mockIdentity);
      });
    });
  });
  describe("getIdentityProviderUrl", () => {
    it("should return old mainnet identity from ic0.app", async () => {
      Object.defineProperty(window, "location", {
        writable: true,
        value: { host: "nns.ic0.app" },
      });

      expect(await getIdentityProviderUrl()).toEqual(
        "https://identity.ic0.app"
      );
    });

    it("should return old mainnet identity from ic0.app", async () => {
      Object.defineProperty(window, "location", {
        writable: true,
        value: { host: "qoctq-giaaa-aaaaa-aaaea-cai.ic0.app" },
      });

      expect(await getIdentityProviderUrl()).toEqual(
        "https://identity.ic0.app"
      );
    });

    it("should return IDENTITY_SERVICE_URL when not old mainnet", async () => {
      Object.defineProperty(window, "location", {
        writable: true,
        value: { host: "nns.internetcomputer.org" },
      });

      expect(await getIdentityProviderUrl()).toEqual("http://localhost:8000/");
    });
  });
});
