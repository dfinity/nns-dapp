/**
 * @jest-environment jsdom
 */

import { AuthClient } from "@dfinity/auth-client";
import { mock } from "jest-mock-extended";
import {
  displayAndCleanLogoutMsg,
  logout,
} from "../../../lib/services/auth.services";
import { toastsStore } from "../../../lib/stores/toasts.store";
import * as routeUtils from "../../../lib/utils/route.utils";

describe("auth-services", () => {
  const mockAuthClient = mock<AuthClient>();

  const { reload, href, search } = window.location;

  beforeAll(() => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { reload: jest.fn(), href, search },
    });

    jest
      .spyOn(AuthClient, "create")
      .mockImplementation(async (): Promise<AuthClient> => mockAuthClient);
  });

  afterAll(() => (window.location.reload = reload));

  it("should call auth-client logout on logout", async () => {
    const spy = jest.spyOn(mockAuthClient, "logout");

    await logout({});

    expect(spy).toHaveBeenCalled();
  });

  it("should clear storage", async () => {
    const spy = jest.spyOn(Storage.prototype, "clear");

    await logout({});

    expect(spy).toHaveBeenCalled();
  });

  it("should reload browser", async () => {
    const spy = jest.spyOn(window.location, "reload");

    await logout({});

    expect(spy).toHaveBeenCalled();
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
});
