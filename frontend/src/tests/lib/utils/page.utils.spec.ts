import { AppPath, ROUTE_ID_GROUP_APP } from "$lib/constants/routes.constants";
import { pathForRouteId } from "$lib/utils/page.utils";

describe("page.utils", () => {
  it("should find no path and fallback to Portfolio path", () => {
    expect(pathForRouteId(undefined)).toEqual(AppPath.Portfolio);
    expect(pathForRouteId(null)).toEqual(AppPath.Portfolio);
    expect(pathForRouteId("yolo")).toEqual(AppPath.Portfolio);
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
  });
});
