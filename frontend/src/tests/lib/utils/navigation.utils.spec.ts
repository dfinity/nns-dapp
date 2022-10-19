import { AppPathLegacy } from "$lib/constants/routes.constants";
import { reloadRouteData } from "$lib/utils/navigation.utils";

describe("navigation-utils", () => {
  it("should not reload on back", () => {
    expect(
      reloadRouteData({
        expectedPreviousPath: AppPathLegacy.CanisterDetail,
        effectivePreviousPath: `${AppPathLegacy.CanisterDetail}/va76m-bqaaa-aaaaa-aaayq-cai`,
        currentData: ["test"],
      })
    ).toBeFalsy();
  });

  it("should reload if not expected route referrer", () => {
    expect(
      reloadRouteData({
        expectedPreviousPath: AppPathLegacy.CanisterDetail,
        effectivePreviousPath: `${AppPathLegacy.NeuronDetail}/va76m-bqaaa-aaaaa-aaayq-cai`,
        currentData: ["test"],
      })
    ).toBeTruthy();

    expect(
      reloadRouteData({
        expectedPreviousPath: AppPathLegacy.CanisterDetail,
        effectivePreviousPath: AppPathLegacy.NeuronDetail,
        currentData: ["test"],
      })
    ).toBeTruthy();

    expect(
      reloadRouteData({
        expectedPreviousPath: AppPathLegacy.CanisterDetail,
        effectivePreviousPath: undefined,
        currentData: ["test"],
      })
    ).toBeTruthy();

    expect(
      reloadRouteData({
        expectedPreviousPath: AppPathLegacy.CanisterDetail,
        effectivePreviousPath: "/",
        currentData: ["test"],
      })
    ).toBeTruthy();
  });

  it("should reload if data empty", () => {
    expect(
      reloadRouteData({
        expectedPreviousPath: AppPathLegacy.CanisterDetail,
        effectivePreviousPath: `${AppPathLegacy.NeuronDetail}/va76m-bqaaa-aaaaa-aaayq-cai`,
        currentData: [],
      })
    ).toBeTruthy();

    expect(
      reloadRouteData({
        expectedPreviousPath: AppPathLegacy.CanisterDetail,
        effectivePreviousPath: `${AppPathLegacy.NeuronDetail}/va76m-bqaaa-aaaaa-aaayq-cai`,
        currentData: undefined,
      })
    ).toBeTruthy();
  });
});
