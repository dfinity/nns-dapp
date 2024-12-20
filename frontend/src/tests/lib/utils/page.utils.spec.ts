import { AppPath, ROUTE_ID_GROUP_APP } from "$lib/constants/routes.constants";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { pathForRouteId } from "$lib/utils/page.utils";

describe("page.utils", () => {
  it("should find no path and fallback to accounts path", () => {
    expect(pathForRouteId(undefined)).toEqual(AppPath.Accounts);
    expect(pathForRouteId(null)).toEqual(AppPath.Accounts);
    expect(pathForRouteId("yolo")).toEqual(AppPath.Accounts);
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

  describe("ENABLE_PORTFOLIO_PAGE feature flag is one", () => {
    it("should find no path and fallback to accounts path", () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_PORTFOLIO_PAGE", true);
      expect(pathForRouteId(undefined)).toEqual(AppPath.Portfolio);
      expect(pathForRouteId(null)).toEqual(AppPath.Portfolio);
      expect(pathForRouteId("yolo")).toEqual(AppPath.Portfolio);
    });
  });
});
