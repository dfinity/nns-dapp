import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath, UNIVERSE_PARAM } from "$lib/constants/routes.constants";
import { buildUrl, reloadRouteData } from "$lib/utils/navigation.utils";

describe("navigation-utils", () => {
  describe("reload", () => {
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

  describe("url", () => {
    it("should build url", () => {
      expect(
        buildUrl({
          path: AppPath.Proposal,
          universe: OWN_CANISTER_ID_TEXT,
          params: { proposal: `123` },
        })
      ).toEqual(
        `${AppPath.Proposal}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}&proposal=123`
      );

      expect(
        buildUrl({
          path: AppPath.Proposal,
          universe: OWN_CANISTER_ID_TEXT,
        })
      ).toEqual(
        `${AppPath.Proposal}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}`
      );
    });
  });
});
