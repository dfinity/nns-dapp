import { AppPath, ROUTE_ID_GROUP_APP } from "$lib/constants/routes.constants";
import { pathForRouteId } from "$lib/utils/page.utils";

describe("page.utils", () => {
  it("should find no path and fallback to auth path", () => {
    expect(pathForRouteId(undefined)).toEqual(AppPath.Authentication);
    expect(pathForRouteId(null)).toEqual(AppPath.Authentication);
    expect(pathForRouteId("yolo")).toEqual(AppPath.Authentication);
  });

  it("should map app path", () => {
    expect(pathForRouteId(AppPath.Accounts)).toEqual(AppPath.Accounts);
    expect(pathForRouteId("/accounts")).toEqual(AppPath.Accounts);
    expect(pathForRouteId("/accounts/")).toEqual(AppPath.Accounts);
  });

  it("should map app path with group", () => {
    expect(pathForRouteId(`${ROUTE_ID_GROUP_APP}${AppPath.Accounts}`)).toEqual(
      AppPath.Accounts
    );
    // Check also with initial slash
    expect(pathForRouteId(`/${ROUTE_ID_GROUP_APP}${AppPath.Accounts}`)).toEqual(
      AppPath.Accounts
    );
  });
});
