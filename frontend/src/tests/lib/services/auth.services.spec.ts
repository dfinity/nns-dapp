import {
  displayAndCleanLogoutMsg,
  getCurrentIdentity,
  login,
  logout,
} from "$lib/services/auth.services";
import { authStore } from "$lib/stores/auth.store";
import * as busyStore from "$lib/stores/busy.store";
import * as routeUtils from "$lib/utils/route.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { AnonymousIdentity } from "@dfinity/agent";
import { AuthClient, IdbStorage } from "@dfinity/auth-client";
import { toastsStore } from "@dfinity/gix-components";
import { waitFor } from "@testing-library/svelte";
import { mock } from "vitest-mock-extended";

describe("auth-services", () => {
  const originalLocation = window.location;

  beforeEach(async () => {
    await authStore.signOut();
  });

  beforeAll(() => {
    // CAUTION: This replaces window.location but history.replaceState still
    // changes the original value of window.location so code looking at the
    // replaced value of window.location will not see such changes.
    // So if we do this in beforeEach instead of beforeAll, it results in
    // changes caused by tests being copied over to the new replaced value.
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...originalLocation,
        reload: vi.fn(),
      },
    });
  });

  describe("auth-client", () => {
    it("agent-js should clear indexeddb auth info on logout", async () => {
      const idbStorage = new IdbStorage();
      await idbStorage.set("delegation", "value");

      const value = await idbStorage.get("delegation");
      expect(value).not.toBeNull();

      await logout({});

      const valueCleared = await idbStorage.get("delegation");
      expect(valueCleared).toBeNull();
    });
  });

  describe("auth-client-mocked", () => {
    const mockAuthClient = mock<AuthClient>();
    mockAuthClient.login.mockResolvedValue(undefined);
    mockAuthClient.logout.mockResolvedValue(undefined);

    beforeEach(() => {
      vi.spyOn(AuthClient, "create").mockImplementation(
        async (): Promise<AuthClient> => mockAuthClient
      );

      vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should call auth-client login on login", async () => {
      const spy = vi.spyOn(mockAuthClient, "login");

      await login();

      expect(spy).toHaveBeenCalled();
    });

    it("should not toast error on auth-client error UserInterrupt", async () => {
      vi.spyOn(mockAuthClient, "login").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore simplified for testing purpose
        ({ onError }: { onError: (err: unknown) => void }) => {
          onError("UserInterrupt");
        }
      );

      const spy = vi.spyOn(toastsStore, "show");

      await login();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should call auth-client logout on logout", async () => {
      const spy = vi.spyOn(mockAuthClient, "logout");

      await logout({});

      expect(spy).toHaveBeenCalled();
    });

    it("should reload browser", async () => {
      const spy = vi.spyOn(window.location, "reload");

      await logout({});

      await waitFor(() => expect(spy).toHaveBeenCalled());
    });

    it("should add msg to url", async () => {
      const spy = vi.spyOn(routeUtils, "replaceHistory");

      await logout({ msg: { labelKey: "test.key", level: "warn" } });

      expect(spy).toHaveBeenCalled();

      spy.mockClear();
    });

    it("should not add msg to url", async () => {
      const spy = vi.spyOn(routeUtils, "replaceHistory");

      await logout({});

      expect(spy).not.toHaveBeenCalled();

      spy.mockClear();
    });

    it("should not display msg from url", async () => {
      const spy = vi.spyOn(toastsStore, "show");

      await displayAndCleanLogoutMsg();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should display msg from url", async () => {
      const spy = vi.spyOn(toastsStore, "show");

      const location = window.location;

      Object.defineProperty(window, "location", {
        writable: true,
        value: { ...location, search: "msg=test.key&level=warn" },
      });

      await displayAndCleanLogoutMsg();

      expect(spy).toHaveBeenCalled();

      Object.defineProperty(window, "location", {
        writable: true,
        value: { ...location },
      });

      spy.mockClear();
    });

    it("should clean msg from url", async () => {
      const spy = vi.spyOn(routeUtils, "replaceHistory");

      const location = window.location;

      Object.defineProperty(window, "location", {
        writable: true,
        value: { ...location, search: "msg=test.key&level=warn" },
      });

      await displayAndCleanLogoutMsg();

      expect(spy).toHaveBeenCalled();

      Object.defineProperty(window, "location", {
        writable: true,
        value: { ...location },
      });

      spy.mockClear();
    });

    it("should display a busy screen", async () => {
      const spy = vi.spyOn(busyStore, "startBusy");

      await logout({});

      expect(spy).toHaveBeenCalled();

      spy.mockClear();
    });
  });

  describe("getCurrentIdentity", () => {
    it("should returns anonymous identity", () => {
      authStore.setForTesting(undefined);

      expect(getCurrentIdentity().getPrincipal().toText()).toEqual(
        new AnonymousIdentity().getPrincipal().toText()
      );
    });

    it("should returns signed-in identity", () => {
      authStore.setForTesting(mockIdentity);

      expect(getCurrentIdentity().getPrincipal().toText()).toEqual(
        mockIdentity.getPrincipal().toText()
      );
    });
  });
});
