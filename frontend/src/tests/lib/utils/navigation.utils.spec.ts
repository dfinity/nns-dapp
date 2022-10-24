import { AppPath } from "$lib/constants/routes.constants";
import { reloadRouteData } from "$lib/utils/navigation.utils";

describe("navigation-utils", () => {
  it("should not reload on back", () => {
    expect(
      reloadRouteData({
        expectedPreviousPath: AppPath.Canister,
        effectivePreviousPath: AppPath.Canister,
        currentData: ["test"],
      })
    ).toBeFalsy();
  });

  it("should reload if not expected route referrer", () => {
    expect(
      reloadRouteData({
        expectedPreviousPath: AppPath.Canister,
        effectivePreviousPath: AppPath.Neuron,
        currentData: ["test"],
      })
    ).toBeTruthy();

    expect(
      reloadRouteData({
        expectedPreviousPath: AppPath.Canister,
        effectivePreviousPath: AppPath.Neuron,
        currentData: ["test"],
      })
    ).toBeTruthy();

    expect(
      reloadRouteData({
        expectedPreviousPath: AppPath.Canister,
        effectivePreviousPath: undefined,
        currentData: ["test"],
      })
    ).toBeTruthy();

    expect(
      reloadRouteData({
        expectedPreviousPath: AppPath.Canister,
        effectivePreviousPath: AppPath.Authentication,
        currentData: ["test"],
      })
    ).toBeTruthy();
  });

  it("should reload if data empty", () => {
    expect(
      reloadRouteData({
        expectedPreviousPath: AppPath.Canister,
        effectivePreviousPath: AppPath.Neuron,
        currentData: [],
      })
    ).toBeTruthy();

    expect(
      reloadRouteData({
        expectedPreviousPath: AppPath.Canister,
        effectivePreviousPath: AppPath.Neuron,
        currentData: undefined,
      })
    ).toBeTruthy();
  });
});
