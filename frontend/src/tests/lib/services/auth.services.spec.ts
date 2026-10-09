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
import en from "$tests/mocks/i18n.mock";
import { toastsStore } from "@dfinity/gix-components";
import { AuthClient, IdbStorage } from "@icp-sdk/auth/client";
import { AnonymousIdentity } from "@icp-sdk/core/agent";
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

      await logout({ msg: "warning.auth_sign_out" });

      expect(spy).toHaveBeenCalledTimes(1);

      const url = spy.mock.calls[0][0];
      expect(url.searchParams.get("msg")).toEqual("warning.auth_sign_out");
      expect(url.searchParams.get("level")).toBeNull();

      spy.mockClear();
    });

    it("should drop a pre-existing level param when adding msg to url", async () => {
      const spy = vi.spyOn(routeUtils, "replaceHistory");

      const location = window.location;
      const search = "level=success";

      Object.defineProperty(window, "location", {
        writable: true,
        value: {
          ...location,
          href: `https://nns.internetcomputer.org/accounts?${search}`,
          search,
        },
      });

      await logout({ msg: "warning.auth_sign_out" });

      expect(spy).toHaveBeenCalledTimes(1);

      const url = spy.mock.calls[0][0];
      expect(url.searchParams.get("msg")).toEqual("warning.auth_sign_out");
      expect(url.searchParams.get("level")).toBeNull();

      Object.defineProperty(window, "location", {
        writable: true,
        value: { ...location },
      });

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
        value: { ...location, search: "msg=warning.auth_sign_out" },
      });

      await displayAndCleanLogoutMsg();

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "warn",
          text: en.warning.auth_sign_out,
        })
      );

      Object.defineProperty(window, "location", {
        writable: true,
        value: { ...location },
      });

      spy.mockClear();
    });

    it("should clean msg from url", async () => {
      const spy = vi.spyOn(routeUtils, "replaceHistory");

      const location = window.location;
      const search = "msg=warning.auth_sign_out&level=warn";

      // cleanUpMsgUrl builds its url from href, so href must carry the query.
      Object.defineProperty(window, "location", {
        writable: true,
        value: {
          ...location,
          href: `https://nns.internetcomputer.org/accounts?${search}`,
          search,
        },
      });

      await displayAndCleanLogoutMsg();

      expect(spy).toHaveBeenCalledTimes(1);

      const url = spy.mock.calls[0][0];
      expect(url.searchParams.get("msg")).toBeNull();
      expect(url.searchParams.get("level")).toBeNull();

      Object.defineProperty(window, "location", {
        writable: true,
        value: { ...location },
      });

      spy.mockClear();
    });

    it("should ignore an unknown msg from url", async () => {
      const toastSpy = vi.spyOn(toastsStore, "show");
      const historySpy = vi.spyOn(routeUtils, "replaceHistory");

      const location = window.location;
      const search = "msg=Send%20funds%20now&level=error";

      // cleanUpMsgUrl builds its url from href, so href must carry the query.
      Object.defineProperty(window, "location", {
        writable: true,
        value: {
          ...location,
          href: `https://nns.internetcomputer.org/accounts?${search}`,
          search,
        },
      });

      await displayAndCleanLogoutMsg();

      expect(toastSpy).not.toHaveBeenCalled();
      expect(historySpy).toHaveBeenCalledTimes(1);

      const url = historySpy.mock.calls[0][0];
      expect(url.searchParams.get("msg")).toBeNull();
      expect(url.searchParams.get("level")).toBeNull();

      Object.defineProperty(window, "location", {
        writable: true,
        value: { ...location },
      });

      toastSpy.mockClear();
      historySpy.mockClear();
    });

    it("should clean a bare level from url with no msg", async () => {
      const toastSpy = vi.spyOn(toastsStore, "show");
      const historySpy = vi.spyOn(routeUtils, "replaceHistory");

      const location = window.location;
      const search = "level=error";

      // cleanUpMsgUrl builds its url from href, so href must carry the query.
      Object.defineProperty(window, "location", {
        writable: true,
        value: {
          ...location,
          href: `https://nns.internetcomputer.org/accounts?${search}`,
          search,
        },
      });

      await displayAndCleanLogoutMsg();

      expect(toastSpy).not.toHaveBeenCalled();
      expect(historySpy).toHaveBeenCalledTimes(1);

      const url = historySpy.mock.calls[0][0];
      expect(url.searchParams.get("msg")).toBeNull();
      expect(url.searchParams.get("level")).toBeNull();

      Object.defineProperty(window, "location", {
        writable: true,
        value: { ...location },
      });

      toastSpy.mockClear();
      historySpy.mockClear();
    });

    it("should ignore the level from url", async () => {
      const spy = vi.spyOn(toastsStore, "show");

      const location = window.location;

      Object.defineProperty(window, "location", {
        writable: true,
        value: {
          ...location,
          search: "msg=error.missing_identity&level=success",
        },
      });

      await displayAndCleanLogoutMsg();

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "error",
          text: en.error.missing_identity,
        })
      );

      Object.defineProperty(window, "location", {
        writable: true,
        value: { ...location },
      });

      spy.mockClear();
    });

    it("should ignore a prototype key from url", async () => {
      const spy = vi.spyOn(toastsStore, "show");

      const location = window.location;

      Object.defineProperty(window, "location", {
        writable: true,
        value: { ...location, search: "msg=constructor" },
      });

      await displayAndCleanLogoutMsg();

      expect(spy).not.toHaveBeenCalled();

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

    it("should not call logout twice when called concurrently", async () => {
      const reloadSpy = vi.spyOn(window.location, "reload");
      const signOutSpy = vi.spyOn(authStore, "signOut");

      await Promise.all([
        logout({ msg: "warning.auth_sign_out" }),
        logout({ msg: "warning.auth_sign_out" }),
        logout({ msg: "error.missing_identity" }),
      ]);

      expect(signOutSpy).toHaveBeenCalledTimes(1);
      expect(reloadSpy).toHaveBeenCalledTimes(1);
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
