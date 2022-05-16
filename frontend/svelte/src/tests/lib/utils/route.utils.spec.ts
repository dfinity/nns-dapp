/**
 * @jest-environment jsdom
 */

import * as routeUtils from "../../../lib/utils/route.utils";
import {
  baseHref,
  pushHistory,
  replaceHistory,
  routeContext,
  routePath,
} from "../../../lib/utils/route.utils";

describe("route-utils", () => {
  describe("base href", () => {
    it("should return base href according document uri", () => {
      expect(baseHref()).toEqual("/");
    });

    it("should return base href according head tag", () => {
      const base = document.createElement("base");
      base.href = "/test/";
      document.head.appendChild(base);

      expect(baseHref()).toEqual("/test/");

      base.parentElement && base.parentElement.removeChild(base);
    });
  });

  const resetTestURL = (baseUrl) =>
    window.history.replaceState({}, "Test Title", baseUrl);

  const testRoutePath = () => {
    expect(routePath()).toEqual("/");

    window.history.replaceState({}, "", "/?redirect=accounts");
    expect(routePath()).toEqual("/");

    window.history.replaceState({}, "", "/#/accounts");
    expect(routePath()).toEqual("/#/accounts");

    window.history.replaceState({}, "", "/accounts");
    expect(routePath()).toEqual("/accounts");

    window.history.replaceState({}, "", "/#/accounts?param=test");
    expect(routePath()).toEqual("/#/accounts");

    window.history.replaceState({}, "", "/accounts?param=test");
    expect(routePath()).toEqual("/accounts");

    window.history.replaceState({}, "", "/?redirect=proposal/123");
    expect(routePath()).toEqual("/");

    window.history.replaceState({}, "", "/proposal/123");
    expect(routePath()).toEqual("/proposal/123");

    window.history.replaceState({}, "", "/#/proposal/123");
    expect(routePath()).toEqual("/#/proposal/123");

    window.history.replaceState({}, "", "/#/proposal/123?param=test");
    expect(routePath()).toEqual("/#/proposal/123");

    window.history.replaceState({}, "", "/proposal/123?param=test");
    expect(routePath()).toEqual("/proposal/123");
  };

  const testRouteContext = () => {
    expect(routeContext()).toEqual("");

    window.history.replaceState({}, "", "/?redirect=accounts");
    expect(routeContext()).toEqual("");

    window.history.replaceState({}, "", "/#/accounts");
    expect(routeContext()).toEqual("accounts");

    window.history.replaceState({}, "", "/accounts");
    expect(routeContext()).toEqual("accounts");

    window.history.replaceState({}, "", "/#/accounts?param=test");
    expect(routeContext()).toEqual("accounts");

    window.history.replaceState({}, "", "/accounts?param=test");
    expect(routeContext()).toEqual("accounts");

    window.history.replaceState({}, "", "/?redirect=proposal/123");
    expect(routeContext()).toEqual("");

    window.history.replaceState({}, "", "/#/proposal/123");
    expect(routeContext()).toEqual("proposal/123");

    window.history.replaceState({}, "", "/proposal/123");
    expect(routeContext()).toEqual("proposal/123");

    window.history.replaceState({}, "", "/#/proposal/123?param=test");
    expect(routeContext()).toEqual("proposal/123");

    window.history.replaceState({}, "", "/proposal/123?param=test");
    expect(routeContext()).toEqual("proposal/123");
  };

  const testReplaceHistory = ({
    baseUrl,
    historyIndex,
  }: {
    baseUrl: string;
    historyIndex: number;
  }) => {
    replaceHistory({ path: "/" });
    expect(window.location.href).toEqual(baseUrl);
    expect(window.history.length).toEqual(historyIndex + 1);

    replaceHistory({ path: "/", query: "redirect=accounts" });
    expect(window.location.href).toEqual(`${baseUrl}?redirect=accounts`);
    expect(window.history.length).toEqual(historyIndex + 1);

    replaceHistory({ path: "/#/accounts" });
    expect(window.location.href).toEqual(`${baseUrl}#/accounts`);
    expect(window.history.length).toEqual(historyIndex + 1);

    replaceHistory({ path: "/accounts" });
    expect(window.location.href).toEqual(`${baseUrl}accounts`);
    expect(window.history.length).toEqual(historyIndex + 1);

    replaceHistory({ path: "/#/accounts?param=test" });
    expect(window.location.href).toEqual(`${baseUrl}#/accounts?param=test`);
    expect(window.history.length).toEqual(historyIndex + 1);

    replaceHistory({ path: "/accounts?param=test" });
    expect(window.location.href).toEqual(`${baseUrl}accounts?param=test`);
    expect(window.history.length).toEqual(historyIndex + 1);

    replaceHistory({ path: "/accounts?param=test" });
    expect(window.location.href).toEqual(`${baseUrl}accounts?param=test`);
    expect(window.history.length).toEqual(historyIndex + 1);

    replaceHistory({ path: "/proposal/123?param=test" });
    expect(window.location.href).toEqual(`${baseUrl}proposal/123?param=test`);
    expect(window.history.length).toEqual(historyIndex + 1);

    replaceHistory({ path: "/", query: "redirect=proposal/123" });
    expect(window.location.href).toEqual(`${baseUrl}?redirect=proposal/123`);
    expect(window.history.length).toEqual(historyIndex + 1);

    replaceHistory({ path: "/#/proposal/123" });
    expect(window.location.href).toEqual(`${baseUrl}#/proposal/123`);
    expect(window.history.length).toEqual(historyIndex + 1);

    replaceHistory({ path: "/proposal/123" });
    expect(window.location.href).toEqual(`${baseUrl}proposal/123`);
    expect(window.history.length).toEqual(historyIndex + 1);

    replaceHistory({ path: "/#/proposal/123?param=test" });
    expect(window.location.href).toEqual(`${baseUrl}#/proposal/123?param=test`);
    expect(window.history.length).toEqual(historyIndex + 1);

    replaceHistory({ path: "/proposal/123?param=test" });
    expect(window.location.href).toEqual(`${baseUrl}proposal/123?param=test`);
    expect(window.history.length).toEqual(historyIndex + 1);
  };

  const testPushHistory = ({
    baseUrl,
    historyIndex,
  }: {
    baseUrl: string;
    historyIndex: number;
  }) => {
    pushHistory({ path: "/" });
    expect(window.location.href).toEqual(baseUrl);
    expect(window.history.length).toEqual(historyIndex + 2);

    pushHistory({ path: "/", query: "redirect=accounts" });
    expect(window.location.href).toEqual(`${baseUrl}?redirect=accounts`);
    expect(window.history.length).toEqual(historyIndex + 3);

    pushHistory({ path: "/#/accounts" });
    expect(window.location.href).toEqual(`${baseUrl}#/accounts`);
    expect(window.history.length).toEqual(historyIndex + 4);

    pushHistory({ path: "/accounts" });
    expect(window.location.href).toEqual(`${baseUrl}accounts`);
    expect(window.history.length).toEqual(historyIndex + 5);

    pushHistory({ path: "/#/accounts?param=test" });
    expect(window.location.href).toEqual(`${baseUrl}#/accounts?param=test`);
    expect(window.history.length).toEqual(historyIndex + 6);

    pushHistory({ path: "/accounts?param=test" });
    expect(window.location.href).toEqual(`${baseUrl}accounts?param=test`);
    expect(window.history.length).toEqual(historyIndex + 7);

    pushHistory({ path: "/proposal/123?param=test" });
    expect(window.location.href).toEqual(`${baseUrl}proposal/123?param=test`);
    expect(window.history.length).toEqual(historyIndex + 8);

    pushHistory({ path: "/", query: "redirect=proposal/123" });
    expect(window.location.href).toEqual(`${baseUrl}?redirect=proposal/123`);
    expect(window.history.length).toEqual(historyIndex + 9);

    pushHistory({ path: "/#/proposal/123" });
    expect(window.location.href).toEqual(`${baseUrl}#/proposal/123`);
    expect(window.history.length).toEqual(historyIndex + 10);

    pushHistory({ path: "/proposal/123" });
    expect(window.location.href).toEqual(`${baseUrl}proposal/123`);
    expect(window.history.length).toEqual(historyIndex + 11);

    pushHistory({ path: "/#/proposal/123?param=test" });
    expect(window.location.href).toEqual(`${baseUrl}#/proposal/123?param=test`);
    expect(window.history.length).toEqual(historyIndex + 12);

    pushHistory({ path: "/proposal/123?param=test" });
    expect(window.location.href).toEqual(`${baseUrl}proposal/123?param=test`);
    expect(window.history.length).toEqual(historyIndex + 13);
  };

  describe("base href is /", () => {
    const baseUrl = "https://nns.ic0.app/";

    beforeAll(() =>
      jest.spyOn(routeUtils, "baseHref").mockImplementation(() => "/")
    );

    afterEach(() => resetTestURL(baseUrl));

    it("should return the pathname and the hash without base href", () =>
      testRoutePath());

    it("should find context for the route", () => testRouteContext());

    it("should replace location", () =>
      testReplaceHistory({ baseUrl, historyIndex: window.history.length - 1 }));

    it("should push location", () =>
      testPushHistory({ baseUrl, historyIndex: window.history.length - 1 }));
  });

  describe("base href is /v2/", () => {
    const baseUrl = "https://nns.ic0.app/v2/";

    beforeAll(() =>
      jest.spyOn(routeUtils, "baseHref").mockImplementation(() => "/v2/")
    );

    afterEach(() => resetTestURL(baseUrl));

    it("should return the pathname and the hash without base href", () =>
      testRoutePath());

    it("should find context for the route", () => testRouteContext());

    it("should replace location", () =>
      testReplaceHistory({ baseUrl, historyIndex: window.history.length - 1 }));

    it("should push location", () =>
      testPushHistory({ baseUrl, historyIndex: window.history.length - 1 }));
  });
});
