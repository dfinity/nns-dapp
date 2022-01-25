/**
 * @jest-environment jsdom
 */

import {
  replaceHistory,
  routeContext,
  routePath,
} from "../../../lib/utils/route.utils";

describe("route-utils", () => {
  const baseHref = "https://nns.ic0.app/";

  const resetTestURL = () =>
    window.history.replaceState({}, "Test Title", baseHref);

  afterEach(() => resetTestURL());

  // TODO: base href /v2/

  it("should return the pathname and the hash without base href", () => {
    expect(routePath()).toEqual("/");

    window.history.replaceState({}, undefined, "/?redirect=accounts");
    expect(routePath()).toEqual("/");

    window.history.replaceState({}, undefined, "/#/accounts");
    expect(routePath()).toEqual("/#/accounts");

    window.history.replaceState({}, undefined, "/accounts");
    expect(routePath()).toEqual("/accounts");

    // TODO: ?
    window.history.replaceState({}, undefined, "/#/accounts?param=test");
    expect(routePath()).toEqual("/#/accounts?param=test");

    window.history.replaceState({}, undefined, "/accounts?param=test");
    expect(routePath()).toEqual("/accounts");
  });

  it("should find context for the route", () => {
    expect(routeContext()).toEqual("");

    window.history.replaceState({}, undefined, "/?redirect=accounts");
    expect(routeContext()).toEqual("");

    window.history.replaceState({}, undefined, "/#/accounts");
    expect(routeContext()).toEqual("accounts");

    window.history.replaceState({}, undefined, "/accounts");
    expect(routeContext()).toEqual("accounts");

    // TODO: ?
    window.history.replaceState({}, undefined, "/#/accounts?param=test");
    expect(routeContext()).toEqual("accounts?param=test");

    window.history.replaceState({}, undefined, "/accounts?param=test");
    expect(routeContext()).toEqual("accounts");
  });

  it("should replace location", () => {
    replaceHistory({ path: "/" });
    expect(window.location.href).toEqual(baseHref);

    replaceHistory({ path: "/", query: "redirect=accounts"});
    expect(window.location.href).toEqual(`${baseHref}?redirect=accounts`);

    replaceHistory({ path: "/#/accounts"});
    expect(window.location.href).toEqual(`${baseHref}#/accounts`);

    replaceHistory({ path: "/accounts"});
    expect(window.location.href).toEqual(`${baseHref}accounts`);

    replaceHistory({ path: "/#/accounts?param=test"});
    expect(window.location.href).toEqual(`${baseHref}#/accounts?param=test`);

    replaceHistory({ path: "/accounts?param=test"});
    expect(window.location.href).toEqual(`${baseHref}accounts?param=test`);
  });
});
