import {
  IDENTITY_SERVICE_URL,
  OLD_MAINNET_IDENTITY_SERVICE_URL,
} from "$lib/constants/identity.constants";
import {
  getIdentityProviderUrl,
  isSignedIn,
  loadIdentity,
} from "$lib/utils/auth.utils";
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
      mockAuthClient.isAuthenticated.mockResolvedValue(true);
      mockAuthClient.getIdentity.mockResolvedValue(mockIdentity as never);

      beforeEach(() => {
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
    const { host } = window.location;

    afterEach(() => {
      // restore original host
      window.location.host = host;
    });

    /*
        vi.stubEnv(
      "VITE_IDENTITY_SERVICE_URL",
      "http://qhbym-qaaaa-aaaaa-aaafq-cai.localhost:8080"
    );
     */

    it("should return old mainnet identity from ic0.app", async () => {
      Object.defineProperty(window, "location", {
        writable: true,
        value: { host: ".ic0.app" },
      });

      expect(await getIdentityProviderUrl()).toEqual(
        OLD_MAINNET_IDENTITY_SERVICE_URL
      );
    });

    it("should return IDENTITY_SERVICE_URL when not old mainnet", async () => {
      Object.defineProperty(window, "location", {
        writable: true,
        value: { host: "nns.internetcomputer.org" },
      });

      expect(await getIdentityProviderUrl()).toEqual(IDENTITY_SERVICE_URL);
    });
  });
});
