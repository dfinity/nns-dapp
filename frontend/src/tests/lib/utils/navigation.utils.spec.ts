import { AppPath } from "../../../lib/constants/routes.constants";
import { reloadRouteData } from "../../../lib/utils/navigation.utils";

describe("navigation-utils", () => {
  it("should not reload on back", () => {
    expect(
      reloadRouteData({
        expectedPreviousPath: AppPath.CanisterDetail,
        effectivePreviousPath: `${AppPath.CanisterDetail}/va76m-bqaaa-aaaaa-aaayq-cai`,
        currentData: ["test"],
      })
    ).toBeFalsy();
  });

  it("should reload if not expected route referrer", () => {
    expect(
      reloadRouteData({
        expectedPreviousPath: AppPath.CanisterDetail,
        effectivePreviousPath: `${AppPath.NeuronDetail}/va76m-bqaaa-aaaaa-aaayq-cai`,
        currentData: ["test"],
      })
    ).toBeTruthy();

    expect(
      reloadRouteData({
        expectedPreviousPath: AppPath.CanisterDetail,
        effectivePreviousPath: AppPath.NeuronDetail,
        currentData: ["test"],
      })
    ).toBeTruthy();

    expect(
      reloadRouteData({
        expectedPreviousPath: AppPath.CanisterDetail,
        effectivePreviousPath: undefined,
        currentData: ["test"],
      })
    ).toBeTruthy();

    expect(
      reloadRouteData({
        expectedPreviousPath: AppPath.CanisterDetail,
        effectivePreviousPath: "/",
        currentData: ["test"],
      })
    ).toBeTruthy();
  });

  it("should reload if data empty", () => {
    expect(
      reloadRouteData({
        expectedPreviousPath: AppPath.CanisterDetail,
        effectivePreviousPath: `${AppPath.NeuronDetail}/va76m-bqaaa-aaaaa-aaayq-cai`,
        currentData: [],
      })
    ).toBeTruthy();

    expect(
      reloadRouteData({
        expectedPreviousPath: AppPath.CanisterDetail,
        effectivePreviousPath: `${AppPath.NeuronDetail}/va76m-bqaaa-aaaaa-aaayq-cai`,
        currentData: undefined,
      })
    ).toBeTruthy();
  });
});
