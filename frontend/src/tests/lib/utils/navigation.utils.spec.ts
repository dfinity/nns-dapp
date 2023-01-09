/**
 * @jest-environment jsdom
 */

import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  ACCOUNT_PARAM,
  AppPath,
  CANISTER_PARAM,
  NEURON_PARAM,
  PROPOSAL_PARAM,
  UNIVERSE_PARAM,
} from "$lib/constants/routes.constants";
import {
  buildAccountsUrl,
  buildCanistersUrl,
  buildCanisterUrl,
  buildNeuronsUrl,
  buildNeuronUrl,
  buildProposalsUrl,
  buildProposalUrl,
  buildSwitchUniverseUrl,
  buildWalletUrl,
  reloadRouteData,
} from "$lib/utils/navigation.utils";
import { mockSnsFullProject } from "../../mocks/sns-projects.mock";

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
    it("should build wallet url", () => {
      expect(
        buildWalletUrl({
          universe: OWN_CANISTER_ID_TEXT,
          account: "123",
        })
      ).toEqual(
        `${AppPath.Wallet}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}&${ACCOUNT_PARAM}=123`
      );
    });

    it("should build neuron url", () => {
      expect(
        buildNeuronUrl({
          universe: OWN_CANISTER_ID_TEXT,
          neuronId: "123",
        })
      ).toEqual(
        `${AppPath.Neuron}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}&${NEURON_PARAM}=123`
      );
    });

    it("should build proposal url", () => {
      expect(
        buildProposalUrl({
          universe: OWN_CANISTER_ID_TEXT,
          proposalId: "123",
        })
      ).toEqual(
        `${AppPath.Proposal}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}&${PROPOSAL_PARAM}=123`
      );
    });

    it("should build canister url", () => {
      expect(
        buildCanisterUrl({
          universe: OWN_CANISTER_ID_TEXT,
          canister: "123",
        })
      ).toEqual(
        `${AppPath.Canister}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}&${CANISTER_PARAM}=123`
      );
    });

    it("should build accounts url", () => {
      expect(
        buildAccountsUrl({
          universe: OWN_CANISTER_ID_TEXT,
        })
      ).toEqual(
        `${AppPath.Accounts}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}`
      );
    });

    it("should build neurons url", () => {
      expect(
        buildNeuronsUrl({
          universe: OWN_CANISTER_ID_TEXT,
        })
      ).toEqual(
        `${AppPath.Neurons}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}`
      );
    });

    it("should build voting url", () => {
      expect(
        buildProposalsUrl({
          universe: OWN_CANISTER_ID_TEXT,
        })
      ).toEqual(
        `${AppPath.Proposals}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}`
      );
    });

    it("should build canisters url", () => {
      expect(
        buildCanistersUrl({
          universe: OWN_CANISTER_ID_TEXT,
        })
      ).toEqual(
        `${AppPath.Canisters}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}`
      );
    });

    it("should switch universe url", () => {
      const location = window.location;

      Object.defineProperty(window, "location", {
        writable: true,
        value: {
          ...location,
          pathname: `${AppPath.Accounts}`,
          search: undefined,
        },
      });

      const canisterId = mockSnsFullProject.rootCanisterId.toText();

      expect(buildSwitchUniverseUrl(canisterId)).toEqual(
        `${AppPath.Accounts}?${UNIVERSE_PARAM}=${canisterId}`
      );

      Object.defineProperty(window, "location", {
        writable: true,
        value: { ...location },
      });
    });
  });
});
