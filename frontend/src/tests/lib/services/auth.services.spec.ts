/**
 * @jest-environment jsdom
 */

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
import { mock } from "jest-mock-extended";

describe("auth-services", () => {
  const { reload, href, search } = window.location;

  beforeEach(async () => {
    jest.restoreAllMocks();
    await authStore.signOut();
  });

  beforeAll(() => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { reload: jest.fn(), href, search },
    });
  });

  afterAll(() => (window.location.reload = reload));

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

    beforeEach(() => {
      jest.clearAllMocks();

      jest
        .spyOn(AuthClient, "create")
        .mockImplementation(async (): Promise<AuthClient> => mockAuthClient);

      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should call auth-client login on login", async () => {
      const spy = jest.spyOn(mockAuthClient, "login");

      await login();

      expect(spy).toHaveBeenCalled();
    });

    it("should not toast error on auth-client error UserInterrupt", async () => {
      jest.spyOn(mockAuthClient, "login").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore simplified for testing purpose
        ({ onError }: { onError: (err: unknown) => void }) => {
          onError("UserInterrupt");
        }
      );

      const spy = jest.spyOn(toastsStore, "show");

      await login();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should call auth-client logout on logout", async () => {
      const spy = jest.spyOn(mockAuthClient, "logout");

      await logout({});

      expect(spy).toHaveBeenCalled();
    });

    it("should reload browser", async () => {
      const spy = jest.spyOn(window.location, "reload");

      await logout({});

      await waitFor(() => expect(spy).toHaveBeenCalled());
    });

    it("should add msg to url", async () => {
      const spy = jest.spyOn(routeUtils, "replaceHistory");

      await logout({ msg: { labelKey: "test.key", level: "warn" } });

      expect(spy).toHaveBeenCalled();

      spy.mockClear();
    });

    it("should not add msg to url", async () => {
      const spy = jest.spyOn(routeUtils, "replaceHistory");

      await logout({});

      expect(spy).not.toHaveBeenCalled();

      spy.mockClear();
    });

    it("should not display msg from url", async () => {
      const spy = jest.spyOn(toastsStore, "show");

      await displayAndCleanLogoutMsg();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should display msg from url", async () => {
      const spy = jest.spyOn(toastsStore, "show");

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
      const spy = jest.spyOn(routeUtils, "replaceHistory");

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
      const spy = jest.spyOn(busyStore, "startBusy");

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
